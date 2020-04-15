---
layout: post
author: Daniel Bergamin
author_url: /about.html
title:  "My email setup: Design"
series: My Email Setup
part:   "1"
date:   2020-04-10 22:38:46 +0100
categories: tech
---

#### Series Overview

In my post on [digital footprints]({% post_url 2020-03-26-digital-footprints-part-1 %}), I touched on the subject of email, 
and mentioned that I had moved to a custom domain backed by Amazon SES. This series is the more technical follow-up promised – you'll be getting a good look inside the design and implementations for my current personal mail infrastructure.

There'll be a fair bit of fussing over details, so this series will primarily be of interest to someone with technical 
ability who wants to move their mail to a custom domain, whilst retaining a bit of control over the pieces involved.

{: .emphasis-panel}
> In this part, I'll be looking at the problem I was trying to solve, and giving an overview of two solution designs.
>
> Parts 2 and 3 will go in-depth on how the two solutions have been implemented. I'll be providing detailed walkthroughs
of how and why I configured each solution, which you can follow along if you so desire.

----

#### Why?

First, a quick recap of the problem. I had a few motivations to get my email away from being totally dependant on my `private@gmail` account:
+ First and foremost, reading accounts of people that got locked out of their accounts for spurious reasons, and had a hard time getting back in. I need a backup plan if this happens.
+ Reducing participation in the current mail oligopoly. While setting up new outbound mailing systems for an employer, I found the anti-spam measures employed by the big players to be extremely opaque and devoid of any regulatory accountability. Even with properly configured SPF/DKIM and using clean IP's (not on any public blacklist I could find), messages were being classified as spam, and the limited anti-spam decision making info in the mail headers did not explain why. 
+ While I love the spam filtering nous of these free services as a user, being stuck on the other side in this situation was an eye-opener to dangers of email becoming extremely centralised. You shouldn't need to have a Google or Microsoft account to be able to mail their users reliably, and the more we centralise outbound personal mail on these providers, the closer we get to this reality.

My overarching goals would be well served by injecting some diversity into my email setup. This means _at least_ switching to a custom domain to sever the hard dependency, and, with time, ideally running inbound and outbound SMTP flows through a vehicle that isn't Google.

----

### Designs

#### Phase 1

Step one for anyone looking to get some mail independence will always be the same; securing a custom domain. Somewhat ironically, I ended up using [Google Domains][google-domains] for this as they have good TLD coverage, attractive pricing, and can be secured with your standard Google account multi-factor authentication.

Google Domains also offers a convenient feature called [Mail Forwarding][google-mail-forwarding], which lets you set up email address mappings for your custom domain that forward to a Gmail inbox. This enabled a design that kept the increment of change small; continuing to use the same Gmail clients as always across the myriad platforms that I work on, and letting me focus on getting my new address distributed to my connections and various online accounts.

With this in mind, the first design ('Phase 1') looked like this:

![mail setup diagram - phase one](/assets/posts/email-setup/email_arch_diagram_phase_1.svg)
{: .technical-diagram}

**Benefits**
+ Having a custom domain decouples my address from the provider. Should the need arise, I can change the email provider quickly.
+ Able to continue using the Gmail clients/web interface on the various platforms that I use day-to-day. Had I switched to a different mail backend, I would need to find and configure mail clients for Ubuntu, Windows, OSX and Android – not overly difficult, but time-consuming, tedious, and not achieving much in itself.
+ Sending my outbound mail via Amazon [Simple Email Service][aws-ses] (using the Gmail [Send Mail As][send-mail-as] feature) is a convenient way to add some diversity into the mix – not as good as running my own mail server, but a happy medium given the limited amount of time and money I'm willing to invest in setup and maintenance for my email.
+ All components are popular, reliable and used in a supported manner. This builds confidence in the reliability of this design, an essential requirement for email.


**Risks**
+ Increased attack surface, relative to using a single provider. I now have a second system, AWS SES, in the picture – and that needs to be secured appropriately.
  + _Mitigation_: AWS account is not used for more risky operations, which may inadvertently open the door e.g. running dynamic web services.
  + _Mitigation_: This AWS account has no users other than myself, and my access is secured with [AWS MFA][aws-mfa].
+ Domain and mail both held with Google. If Google were to fully suspend the underlying account for some reason, access to the mailbox would be lost, as would the ability to log into their Domains control panel and route to a new email provider.
  + _Mitigation_: The domain and my 'master Gmail inbox' are tied to different Google accounts.

I currently use this approach to run my address, `daniel@bergam.in`, and it's been working well! The next post in this series, Part 2, will be a detailed walkthrough on how I've implemented this design.

For now though, let's keep on going, and take a peek at the 'Phase 2' design.

----

#### Phase 2

While the '2' might imply this is superior to Phase 1, the reality is I'm still working out which I prefer. This design trades more complexity and moving parts for a few additional benefits. I currently use this design to run my secondary address, daniel@danielbergamin.net, along with a few of the standard [RFC2142][rfc2142] addresses for this domain. 

This design is a lot more AWS-centric, using their Route 53, S3 storage and Lamdba services, in addition to SES. As I'd prefer sticking with my Gmail clients for the time being, I've kept using the same master inbox `private@gmail.com` as the backend. 

A [lambda function][aws-ses-mail-forwarder] (which I based on some excellent work from [Joe Turgeon][github-arithmetric]',) associates custom domain inboxes with backend Gmail inboxes, forwarding messages through with source tagging and `reply-to` headers.   

![mail setup diagram - phase two](/assets/posts/email-setup/email_arch_diagram_phase_2.svg)
{: .technical-diagram}

**Benefits (in addition to those listed in Phase 1)**
+ This is much closer to a workable alternative in the event of Google locking me out of my main account. Moving to a different backend Gmail account can be achieved with a simple environment variable update to the Lambda. 
+ Mail is archived in S3 as part of this solution, which is generally desirable.

**Risks**
+ Overall complexity is high as compared to other providers, or even the 'Phase 1' approach.
  + _Mitigation_: The majority of parts are commercially maintained and highly reliable.
+ The lambda contains custom code, which may contain a bug.
  + _Mitigation_: The first link, SES -> S3 is reliable. Reconcile mail counts between S3 and Gmail to monitor the Lambda for problems.
+ Google or Amazon stops supporting required features.
  + _Mitigation_: As we control the DNS record, it is fairly straightforward to change the email provider. The hardest part of moving email is notifying all your contacts and updating accounts everywhere, and I've already done this!

A full tutorial for how I implemented this for my various `@danielbergamin.net` mailboxes will be coming along in Part 2 of this series. Till then, let's wrap up with some parting thoughts and reflections.

----

#### Parting thoughts

All things considered, these setups — particularly 'Phase 2' 🙃 — are objectively overkill. 

Beyond the initial step of using a custom domain, which I'd recommend to everyone, I wouldn't recommend these two designs. Well, not unless you're:
+ technically curious, and/or,
+ _really_ averse to paying a small premium for a product like G-Suite or [Fastmail][fastmail], which could professionally support your custom domain.

That said... I did have a lot of fun setting these up. Besides, as we all know, going 'way too far' and getting a bit silly with your personal infrastructure is a satisfying and time-honoured way to learn! To that end, I'll be writing up walkthroughs detailing how I implemented these setups in Parts 2 and 3 of this series. Stay tuned!

[aws-mfa]:                https://aws.amazon.com/iam/features/mfa/
[aws-ses]:                https://aws.amazon.com/ses/
[aws-ses-mail-forwarder]: https://github.com/dbergamin/aws-lambda-ses-forwarder/tree/dbergamin/aws-deployment-customisations
[fastmail]:               https://www.fastmail.com/
[github-arithmetric]:     https://github.com/arithmetric
[google-domains]:         https://domains.google.com/
[google-mail-forwarding]: https://support.google.com/domains/answer/3251241
[send-mail-as]:           https://support.google.com/mail/answer/22370
[rfc2142]:                https://tools.ietf.org/html/rfc2142
