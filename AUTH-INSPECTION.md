# Authentication source inspection — phone-first correction

Updated 18 October 2026. The user explicitly withdrew the intervening email-first instruction. Phone number + password is now the approved customer-facing flow. This supersedes earlier email-first inspection conclusions; those drafts are archived under ../docs/superseded-auth/ and must not be deployed.

Before correction, staging WordPress Login/Register/Forgot Password and matching templates were inspected. The supplied original plugin folder and deployed 1.11.1 agree on phone identity and support-only recovery.

| Surface | Working WordPress behavior | Corrected Next behavior |
| --- | --- | --- |
| Login | Phone with fixed +, detected country/region, Password, visibility control, Remember Me, Forgot Password, Create Account | Phone with fixed + and detected region above, Password, Show password, Log In, Forgot Password, Register; no identifier selector. Remember Me not requested; existing bounded Next session retained |
| Register | Full Name, Phone/region detection, Password/confirmation, Customer Type, terms/privacy | Same fields and business rules; no Email, Username or Country selector |
| Forgot Password | Phone, Request Help; no automatic SMS/key/email; contact support notice | Native Next phone Request Help calling existing Auth::forgot through transport; same honest notice, no outbound message |
| Account | Native customer, completed Tours, own reviews/eligibility, logout, legacy profile metadata | Customer name, completed Tours, own review statuses/eligibility, logout; legacy stored metadata preserved |

Auth::login, Registration::submit and Settings are byte-identical to the deployed 1.11.1 ZIP. Login normalizes phone then looks up its existing native user; it never inserts users. Email/username handling remains internal backward compatibility. Registration retains with_phone_claim, phone_in_use, opaque native username/placeholder email, subscriber role and customer-type/consent metadata. No identity rules changed.

Next reuses the exact bundled WordPress libphonenumber JS for country detection; backend libphonenumber/PHP normalization is authoritative. Shared PhoneInput is presentation only. The Request Help adapter calls the existing support-only handler; it does not implement a reset engine. Proposed email-only registration, retrieve_password adapter and global staging email interception have been removed. Independent review-owner/cache fixes remain.

The exact 1.12.2 package was subsequently deployed to staging with explicit approval. Real staging phone-flow acceptance passed on 18–19 October 2026. See POC-REPORT.md for separate local/staging results, artifact hash, cache configuration and the remaining stop for full-migration confirmation.