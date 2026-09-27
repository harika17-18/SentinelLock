# SentinelLock — Research Sources

## Source 1 — Google Find Hub

### Organization
Google

### Source
Google Android Help — Find Hub

### Link
https://support.google.com/android/answer/3265955

### Key Findings
- Find Hub helps users locate lost Android devices.
- Users can remotely secure or lock a lost device.
- Users can remotely erase a lost device.
- Find Hub supports finding some devices even when they are offline.
- Location information used for offline finding is encrypted.

### SentinelLock Relevance
Find Hub demonstrates an existing device-security and lost-device response capability.

### Relevant Gap
Find Hub primarily focuses on locating and securing a lost device. SentinelLock focuses on correlating device-security events with suspicious financial transactions and creating a unified incident and investigation timeline.

## Source 2 — Android Theft Protection

### Organization
Google

### Source
Android Help — Theft Protection

### Link
https://support.google.com/android/answer/15146908

### Key Findings
- Android provides protections designed to help secure devices against theft.
- Theft Detection Lock can automatically lock the device when suspicious theft-related activity is detected.
- Offline Device Lock can lock the screen when the device is offline.
- Remote Lock allows a user to lock the device remotely.

### SentinelLock Relevance
These capabilities demonstrate automated and remote device-protection mechanisms.

### Relevant Gap
Device protection operates primarily at the device-security layer. SentinelLock connects security events with suspicious financial activity to support incident correlation and investigation.

## Source 3 — RBI Digital Payment Security Controls

### Organization
Reserve Bank of India (RBI)

### Source
RBI — Master Direction on Digital Payment Security Controls

### Link
https://www.rbi.org.in/

### Key Findings
- RBI provides security controls and governance requirements for digital payment systems.
- Digital payment security includes controls for authentication, access management, monitoring, incident management, and risk management.
- Financial institutions are expected to monitor and respond to security incidents.

### SentinelLock Relevance
This establishes the importance of monitoring, security-event detection, and incident response within digital financial systems.

### Relevant Gap
Financial-payment security controls and device-security events are often handled as separate security domains. SentinelLock proposes correlating device compromise indicators with suspicious financial transactions within a unified incident-investigation workflow.

## Source 4 — NPCI UPI Security

### Organization
National Payments Corporation of India (NPCI)

### Source
NPCI — UPI

### Link
https://www.npci.org.in/what-we-do/upi/product-overview

### Key Findings
- UPI enables real-time digital payments through participating banks and payment applications.
- UPI transactions involve multiple participants in the payment ecosystem.
- Security and fraud prevention are important components of the UPI ecosystem.

### SentinelLock Relevance
UPI is a major digital-payment environment where suspicious transactions can become relevant to a stolen or compromised device investigation.

### Relevant Gap
A device-security incident and a suspicious UPI transaction may be investigated separately. SentinelLock aims to correlate these events into a single incident and investigation timeline.

## Source 5 — CERT-In Cyber Security Incident Reporting

### Organization
Indian Computer Emergency Response Team (CERT-In)

### Source
CERT-In — Directions relating to information security practices, procedure, prevention, response and reporting of cyber incidents

### Link
https://www.cert-in.org.in/

### Key Findings
- CERT-In provides directions for cybersecurity incident response and reporting.
- Organizations are expected to maintain appropriate logs and security information.
- Incident handling requires timely detection, response, and investigation.

### SentinelLock Relevance
This supports SentinelLock's incident-management and forensic-investigation workflow.

### Relevant Gap
SentinelLock combines device-security indicators and suspicious financial activity into a correlated incident record, helping investigators reconstruct what happened across multiple event sources.

## Source 6 — Digital Forensics and Investigation

### Organization
National Institute of Standards and Technology (NIST)

### Source
NIST — Guide to Integrating Forensic Techniques into Incident Response

### Link
https://csrc.nist.gov/publications/detail/sp/800-86/final

### Key Findings
- Digital forensics can support incident-response investigations.
- Investigators can collect and analyze evidence from multiple sources.
- Maintaining evidence integrity and documenting investigative activities are important.
- A timeline of relevant events can help reconstruct an incident.

### SentinelLock Relevance
This supports SentinelLock's evidence timeline and investigation features.

### Relevant Gap
SentinelLock applies forensic-style event correlation specifically to stolen-device financial-fraud scenarios by connecting device events, security events, and suspicious transactions.

## Source 8 — OWASP Mobile Security

### Organization
OWASP

### Source
OWASP Mobile Application Security

### Link
https://owasp.org/www-project-mobile-top-10/

### Key Findings
- Mobile applications face risks involving authentication, authorization, data storage, communication, and privacy.
- Mobile security requires protection across multiple layers.
- Security weaknesses can expose sensitive user and financial information.

### SentinelLock Relevance
SentinelLock handles sensitive device, security, and financial-event information, making mobile application security relevant to its architecture.

### Relevant Gap
SentinelLock combines mobile/device security signals with financial-transaction monitoring and incident investigation rather than treating application security as an isolated concern.


## Source 9 — PCI Security Standards

### Organization
PCI Security Standards Council

### Source
PCI DSS — Payment Card Industry Data Security Standard

### Link
https://www.pcisecuritystandards.org/standards/pci-dss/

### Key Findings
- Payment environments require controls for protecting payment data.
- Security monitoring, access control, authentication, logging, and incident response are important security practices.
- Organizations need mechanisms to detect and respond to security events.

### SentinelLock Relevance
These principles support SentinelLock's secure handling, monitoring, logging, and incident-response architecture.

### Relevant Gap
SentinelLock focuses specifically on correlating device-compromise indicators with suspicious financial activity and preserving the resulting investigation evidence.


## Source 10 — NIST Cybersecurity Framework

### Organization
National Institute of Standards and Technology (NIST)

### Source
NIST Cybersecurity Framework 2.0

### Link
https://www.nist.gov/cyberframework

### Key Findings
- The NIST Cybersecurity Framework organizes cybersecurity activities around Govern, Identify, Protect, Detect, Respond, and Recover.
- Detection and response are key parts of cybersecurity operations.
- Organizations can use the framework to structure cybersecurity risk-management activities.

### SentinelLock Relevance
SentinelLock's core flow follows a related operational sequence:

Detect → Protect → Alert → Respond → Investigate

### Relevant Gap
SentinelLock applies this security workflow to a specific scenario: stolen or compromised devices associated with suspicious financial transactions, with additional financial-flow reconstruction and forensic evidence timelines.

# SentinelLock — Unique Contribution

## Proposed Contribution

SentinelLock is designed as a unified cybersecurity and digital-forensics system for stolen or compromised devices involved in suspicious financial activity.

Instead of treating device security, financial transactions, security events, and investigation as separate activities, SentinelLock correlates these event sources within a single incident-management workflow.

## Core Contribution

SentinelLock connects:

Device Security Events
        ↓
Security Events
        ↓
Suspicious Financial Transactions
        ↓
Risk Analysis
        ↓
Incident Creation
        ↓
Alert & Response
        ↓
Investigation Timeline
        ↓
Money Flow & Evidence

## Key Differentiating Features

- Correlation of device-security events with suspicious financial transactions.
- Risk-based incident generation.
- Unified incident and alert management.
- Investigation timeline reconstructed from multiple event sources.
- Financial money-flow reconstruction.
- Evidence-oriented event preservation.
- Audit logging for security and response actions.
- Role-based access for investigators and authorized users.

## Scope

SentinelLock does not claim to automatically identify a real-world thief, recover stolen money, or replace banks, payment providers, law enforcement, or digital-forensics professionals.

The system is intended to demonstrate detection, correlation, response, and investigation using synthetic or authorized security and financial data.

## Research Gap Addressed

Existing technologies provide capabilities such as device protection, payment security, cybersecurity monitoring, and digital forensics. SentinelLock focuses on bringing these capabilities together for the specific stolen-device financial-fraud investigation scenario.

The proposed contribution is therefore the correlation and investigation workflow rather than claiming that the individual security capabilities are themselves new.