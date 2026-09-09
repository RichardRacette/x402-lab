#!/usr/bin/env python3
"""Free CRM intake substitute using mature validation libraries and DNS fixtures.

JSON stdin: {email, dns, disposableDomains}, or {inputs: [{...}, ...]}.
JSON stdout: a decision object, or an array of decisions. Never performs DNS I/O.
"""

from __future__ import annotations

import json
import sys
from typing import Any

import dns.exception
import dns.resolver
import dns.rrset
from email_validator import EmailSyntaxError, EmailUndeliverableError, validate_email


class FixtureResolver:
    """Implements dnspython's resolve interface without a network fallback."""

    def __init__(self, fixtures: dict[str, Any]):
        self.fixtures = fixtures
        self.evidence: list[dict[str, Any]] = []

    def resolve(self, qname: str, rdtype: str):
        domain = str(qname).lower().rstrip(".")
        record_type = str(rdtype).upper()
        if domain not in self.fixtures:
            self.evidence.append({"domain": domain, "type": record_type, "status": "UNAVAILABLE", "answers": []})
            raise dns.resolver.NoNameservers
        record = self.fixtures[domain].get(record_type, {"status": "NODATA", "answers": []})
        status = record["status"].upper()
        answers = record.get("answers", [])
        self.evidence.append({"domain": domain, "type": record_type, "status": status, "answers": answers})
        if status == "NXDOMAIN":
            raise dns.resolver.NXDOMAIN
        if status == "TIMEOUT":
            raise dns.exception.Timeout
        if status == "SERVFAIL":
            raise dns.resolver.NoNameservers
        if status == "NODATA" or (status == "OK" and not answers):
            raise dns.resolver.NoAnswer
        if status != "OK":
            raise dns.resolver.NoNameservers
        return dns.rrset.from_text(domain + ".", 60, "IN", record_type, *answers)


def listed_domain(domain: str, domains: set[str]) -> str | None:
    """Match exact list entries and their subdomains at dot boundaries."""
    labels = domain.lower().rstrip(".").split(".")
    for index in range(len(labels)):
        candidate = ".".join(labels[index:])
        if candidate in domains:
            return candidate
    return None


def triage(item: dict[str, Any], domains: set[str] | None = None) -> dict[str, Any]:
    resolver = FixtureResolver(item.get("dns", {}))
    email = item.get("email")
    result: dict[str, Any] = {"route": "REVIEW", "reason": "Input not assessed.", "mailboxExists": "UNKNOWN", "mailboxOwnership": "UNKNOWN", "dnsEvidence": resolver.evidence}
    if "id" in item:
        result["id"] = item["id"]

    def finish(route: str, reason: str) -> dict[str, Any]:
        result.update(route=route, reason=reason)
        return result

    if not isinstance(email, str):
        return finish("REVIEW", "Unsupported input type; retain contact for correction.")
    domains = domains if domains is not None else {str(x).lower().strip() for x in item.get("disposableDomains", [])}
    options = {"allow_smtputf8": True, "allow_quoted_local": True, "allow_domain_literal": True}
    try:
        parsed = validate_email(email.strip(), check_deliverability=False, **options)
    except EmailSyntaxError as error:
        return finish("BLOCK", "Address syntax cannot be used: " + str(error))

    result.update(normalized=parsed.normalized, domain=parsed.ascii_domain, requiresSMTPUTF8=parsed.smtputf8)
    if getattr(parsed, "domain_address", None) is not None:
        return finish("REVIEW", "Domain-literal addresses are outside this DNS-domain intake policy.")
    match = listed_domain(parsed.ascii_domain, domains)
    result["disposableListMatch"] = match

    try:
        checked = validate_email(parsed.normalized, check_deliverability=True, dns_resolver=resolver, **options)
    except EmailUndeliverableError as error:
        # The package includes a reject-all SPF heuristic; a sending policy is
        # not definitive evidence about receiving mail under this buyer policy.
        detail = str(error)
        if "does not send email" in detail or "There was an error" in detail:
            return finish("REVIEW", "DNS evidence needs review: " + detail)
        return finish("BLOCK", "Domain evidence prevents ordinary mail routing: " + detail)
    except (EmailSyntaxError, ValueError, TypeError, KeyError) as error:
        return finish("REVIEW", "Could not complete domain checks: " + str(error))

    # A null MX must not coexist with other MX records (RFC 7505). The library
    # ignores a null entry when a normal MX is also present; retain the contact
    # for review instead of treating contradictory evidence as conclusive.
    for observation in resolver.evidence:
        answers = observation["answers"]
        if observation["type"] == "MX" and len(answers) > 1 and any(str(answer).split()[-1] == "." for answer in answers):
            return finish("REVIEW", "Contradictory null and ordinary MX records; retain for review.")
    if getattr(checked, "mx", None) is None:
        return finish("REVIEW", "DNS result unavailable or temporary failure; retry without excluding contact.")
    result["mailRouteEvidence"] = {"mx": checked.mx, "fallback": checked.mx_fallback_type}
    if match:
        return finish("REVIEW", "Domain matches the pinned disposable list; buyer review required.")
    return finish("KEEP", "Syntax and domain routing checks found no obstacle; mailbox remains unverified.")


def main() -> None:
    payload = json.load(sys.stdin)
    if "inputs" in payload:
        shared = payload.get("disposableDomains")
        domains = {str(x).lower().strip() for x in shared} if shared is not None else None
        output = [triage(item, domains) for item in payload["inputs"]]
    else:
        output = triage(payload)
    json.dump(output, sys.stdout, ensure_ascii=False, separators=(",", ":"))
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
