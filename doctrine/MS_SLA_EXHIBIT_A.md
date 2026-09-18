# PRIME Maintenance & Support + Exhibit A SLA (INTERNAL DOCTRINE)

> **HARD RULE — rule engine only.**  
> Bricely and any customer-facing surface MUST NEVER quote, cite, paraphrase, or expose
> this document (severity labels, SLA targets, coverage, billable/excluded terms, contract
> language). Translate every rules-decision into a plain, warm human sentence.  
> Many users are not the contract holder (sellers, buyers, downstream) — never say
> “your SLA,” “your contract,” or “your plan” in chat.

**Source:** PRIME Master License / M&S terms (Maintenance and Support election + §§18–35 + Exhibit A).  
**Channel (internal ops):** `support@prime-timesystems.com`  
**Support Hours (internal):** Mon–Fri 9:00 a.m.–5:00 p.m. Eastern, excluding US federal holidays.  
**Not** 24×365 unless an Order Form expressly states otherwise.

---

## Election of Maintenance and Support

Maintenance and Support services are optional and are not included in the base license fee unless expressly stated in an Order Form.

Customer may elect Maintenance and Support by signing an Order Form, support schedule, or other written document identifying: the covered Software; the Maintenance and Support start date; the Maintenance and Support term; the applicable fees; the applicable SLA; and any special support terms.

If Customer does not elect Maintenance and Support, PRIME has no continuing obligation to provide ongoing support, maintenance, troubleshooting, updates, fixes, or technical assistance after expiration of any expressly stated warranty period.

---

## 18. Covered Maintenance and Support Services

If elected, PRIME will provide the following services:

1. troubleshooting of reproducible defects in PRIME-controlled Software;
2. reasonable configuration assistance;
3. commercially reasonable bug fixes;
4. security patches PRIME determines are appropriate;
5. compatibility updates for supported environments;
6. reasonable coordination with applicable third-party providers;
7. support through PRIME’s designated support channels; and
8. other services expressly identified in the applicable Order Form.

Maintenance and Support services are subject to the SLA attached as Exhibit A.

### Classifier mapping (internal codes → §18)

| code | Maps to |
|------|---------|
| `defect_fix` | (1)(3) reproducible defects / bug fixes |
| `config_in_product` | (2) configuration assistance |
| `security_patch` | (4) security patches |
| `compat_update` | (5) compatibility updates |
| `third_party_coord` | (6) coordination with third-party providers |
| `channel_support` | (7) designated support channels |
| `order_form_extra` | (8) Order Form–named services |

---

## 19. Excluded Services

Maintenance and Support does **not** include:

- new features;
- product redesigns or rewrites;
- custom development;
- new integrations;
- data migration or data cleanup;
- training;
- consulting;
- support for unsupported environments;
- support for Customer-created modifications;
- support for third-party software not controlled by PRIME;
- emergency or after-hours services;
- issues caused by misuse;
- issues caused by inaccurate Customer Data;
- issues caused by third-party AI, database, hosting, or cloud providers; or
- services outside the SLA.

Excluded work may be performed at PRIME’s then-current rates if separately agreed in writing.

### Classifier mapping (internal codes → §19) — billable / change-order bias

| code | Maps to |
|------|---------|
| `new_feature` | new features |
| `redesign_rewrite` | product redesigns or rewrites |
| `custom_dev` | custom development |
| `integration_new` | new integrations |
| `data_migration` | data migration or cleanup |
| `training` | training |
| `consulting` | consulting |
| `unsupported_env` | unsupported environments |
| `customer_mod` | Customer-created modifications |
| `third_party_sw` | third-party software not controlled by PRIME |
| `after_hours` | emergency / after-hours (unless Order Form) |
| `misuse` | issues caused by misuse |
| `bad_customer_data` | inaccurate Customer Data |
| `third_party_infra` | third-party AI / DB / hosting / cloud |
| `outside_sla` | services outside the SLA |

**Bias:** when unsure between covered (§18) and excluded (§19), route **ambiguous** — a wrong billable call is a customer dispute.

---

## 20. Customer Responsibilities

Customer will:

1. provide accurate information regarding reported issues;
2. provide reasonable access to relevant systems, accounts, logs, and personnel;
3. maintain supported hardware, browsers, integrations, and infrastructure;
4. promptly install or approve necessary updates;
5. avoid unauthorized modifications;
6. designate a primary support contact; and
7. cooperate reasonably with PRIME’s investigation and remediation efforts.

PRIME is not responsible for delays caused by Customer’s failure to perform these responsibilities.

*(Internal: pause SLA clocks while waiting on Customer — see §29.)*

---

## 21. Maintenance and Support Fees

Customer will pay the Maintenance and Support fees stated in the applicable Order Form. Maintenance and Support fees are separate from license fees unless the Order Form expressly states otherwise. Fees are non-refundable except as expressly stated in the Agreement or the applicable Order Form.

*(Never disclose fees/billable status to end users via Bricely.)*

---

## 22. Maintenance and Support Term

The Maintenance and Support term is stated in the applicable Order Form.

Unless otherwise stated, Maintenance and Support will renew for successive periods equal to the initial Maintenance and Support term unless either Party gives at least thirty (30) days’ written notice of non-renewal.

Termination or non-renewal of Maintenance and Support does not terminate Customer’s Software license unless expressly stated in the applicable Order Form or this Agreement.

Upon termination or non-renewal of Maintenance and Support, Customer may continue using the Software during the applicable license term, but PRIME will have no obligation to provide Maintenance and Support services.

---

## 23. Suspension of Maintenance and Support

PRIME may suspend Maintenance and Support if: Customer fails to pay undisputed fees; Customer materially breaches this Agreement; Customer creates a security risk; Customer uses the Software unlawfully; or suspension is necessary to protect PRIME, the Software, or other customers.

Suspension of Maintenance and Support does not automatically terminate the Software license.

---

## 24. Maintenance and Support Intellectual Property

All scripts, tools, methods, patches, fixes, configurations, workflows, edge functions, prompts, diagnostic tools, automation logic, documentation, and other materials used or created by PRIME in performing Maintenance and Support remain PRIME’s property, except for Customer Data.

Customer receives only the rights expressly granted under this Agreement.

---

# PART III — EXHIBIT A: SERVICE LEVEL AGREEMENT

## 25. Support Model

Support is provided during Support Hours: Monday through Friday, 9:00 a.m. to 5:00 p.m. Eastern Time, excluding United States federal holidays.

This SLA does not provide 24-hour, 365-day support unless expressly stated in an Order Form.

## 26. Support Channels

Support requests must be submitted through:

- **Support email:** `support@prime-timesystems.com`

A support request should include: a description of the issue; business impact; affected users; screenshots or logs, where available; steps to reproduce the issue; and the requested severity level.

*(Bricely / widget is an additional designated intake channel for elected tenants; still governed by this SLA internally.)*

## 27. Severity Levels

### 27.1 Severity 1 — Critical

A complete production outage or critical failure that: prevents substantially all Authorized Users from accessing the Software; materially disables the Software’s core functionality; or creates a confirmed material security incident. There must be no reasonable workaround.

### 27.2 Severity 2 — High

A material impairment of important functionality affecting multiple users, where the Software remains partially usable or a workaround may exist.

### 27.3 Severity 3 — Standard

A limited defect, non-critical error, workflow problem, or issue where a reasonable workaround exists.

### 27.4 Severity 4 — Informational

A general question, documentation request, configuration request, cosmetic issue, or enhancement request.

## 28. Initial Response Targets

| Severity | Initial Response Target |
|----------|-------------------------|
| Severity 1 — Critical | Three (3) hours |
| Severity 2 — High | Twenty-four (24) hours |
| Severity 3 — Standard | Forty-eight (48) hours |
| Severity 4 — Informational | Three (3) business days |

The response times in this Section are **initial response targets** and are **not** guaranteed resolution times. Unless an Order Form states otherwise, the response targets are measured during Support Hours.

Severity 1 issues reported outside Support Hours will be addressed on the next business day unless Customer has purchased or otherwise contracted for after-hours emergency support.

### Customer-facing translation (Bricely only — never recite table)

| Internal severity | Warm sentence (example) |
|-------------------|-------------------------|
| Sev 1 | “I’ve flagged this as urgent for the team — someone will pick it up as soon as possible.” |
| Sev 2 | “I’ve passed this to our specialist team — you’ll hear back within a day.” |
| Sev 3–4 | “I’ve passed this to our specialist team — you’ll hear back within 24 hours.” (conservative default for chat) |

## 29. Measurement of Response Times

For purposes of this SLA:

1. the response period begins when PRIME receives sufficient information to investigate the issue;
2. the response period is paused while PRIME is waiting for Customer information, access, approval, or testing;
3. weekends and holidays are excluded unless the applicable Order Form states otherwise;
4. duplicate support requests may be consolidated;
5. PRIME may reclassify a support request if the reported severity is not supported by the facts; and
6. Customer must provide reasonable cooperation and access.

## 30. Resolution and Workarounds

PRIME will use commercially reasonable efforts to: investigate reported issues; provide status updates; develop workarounds where reasonably available; and resolve confirmed defects based on severity, complexity, and available resources.

No guaranteed resolution time applies unless expressly stated in an Order Form.

## 31. Planned Maintenance

PRIME may perform planned maintenance during the following maintenance window: weekends.

PRIME will provide advance notice when reasonably practicable. Emergency maintenance may be performed without advance notice when reasonably necessary to address security, legal, stability, infrastructure, or operational risks.

## 32. Availability

If an availability commitment is stated in the applicable Order Form, PRIME will use commercially reasonable efforts to maintain monthly availability of at least **99.5%** for the hosted Software, excluding Excluded Downtime.

“Excluded Downtime” includes: scheduled maintenance; emergency maintenance; outages caused by third-party AI, cloud, database, hosting, or infrastructure providers; internet, DNS, routing, or telecommunications failures; Customer systems or integrations; Customer misuse; Customer Data; force majeure events; suspension permitted under the Agreement; beta, preview, experimental, or evaluation features; and unauthorized modifications.

## 33. AI and Third-Party Dependencies

The Software may depend on Anthropic, cloud providers, database services, internal edge functions, APIs, hosting providers, storage providers, and other third-party infrastructure.

PRIME will use commercially reasonable efforts to manage those dependencies but is not responsible for availability, performance, latency, rate limits, token limits, usage limits, pricing, policy changes, model changes, or outages outside PRIME’s reasonable control.

## 34. Service Credits

No service credits apply unless expressly stated in the applicable Order Form.

Unless otherwise stated in an Order Form, the support response targets and any availability commitment are Customer’s sole and exclusive SLA-related remedies for service-level failures.

## 35. SLA Exclusions

The SLA does not apply to problems caused by: Customer’s systems; Customer’s network; Customer Data; Customer’s configurations; Customer’s instructions; unauthorized modifications; third-party integrations; third-party providers; unsupported environments; misuse; security credentials controlled by Customer; force majeure events; or suspension permitted under this Agreement.
