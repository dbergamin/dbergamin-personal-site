---
layout: post
author: Daniel Bergamin
author_url: /about.html
title:  "Digital footprints: Public presence"
series: Digital Footprints
part:   "1"
date:   2020-03-26 13:00:33 +0000
categories: tech
---

Ironically, in a few years of dealing with web platforms and infrastructure, I've never taken the time to do some structured thinking about my digital footprint until I was between jobs late last year. I find it hard to focus on personal interests that sit in the same domain as my primary employment. Far easier to gravitate towards my employer's problems whenever mind and motivation leans to doing something constructive with the web – but that's a whole other topic!

{: .emphasis-panel}
> Digital footprint: Everything that I share or create on the internet. Professional and personal, public and private, serious and silly, intentional and incidental.

I started with some fairly obvious questions:
1. What do I want to get out of the internet?
2. If I sat down with a clean slate and designed my 'digital footprint' from scratch to best serve these interests, how would it look different from what I have today?

The thought process is going to be different for everyone, and you may have your own questions to ponder. The 'aha' moment was that I apply structured thought and design to many aspects of my work and life; weighing costs and benefits, setting goals and ambitions, and planning toward them – but I'd never done it for my general usage of the internet! The remainder of this post is going to be about how this process worked out for me; I hope that it sparks some ideas for you, and would love to hear from anyone that gave it a try.

So, back to it: _"What do I want to get out of the internet?"_. The question is broad enough that I'll be splitting my thoughts in two posts, one looking at my public presence, and a follow-up on managing private usage.

Let's start with the public online presence. I want to...
- be easily contactable; for family, old friends and colleagues, prospects... anyone that wants to chat, really.  
- have a record of 'me' online; an up to date personal identity that I have a high degree of control over.
- earn a living; marketing myself and my skills, and communicating with prospective clients or employers.
- be a responsible online citizen; generally leaving the digital world in a better position than I found it.

----

### Rethinking Public Presence

A year ago, my public content sat in a few places: Facebook, Instagram, and, to a lesser extent, LinkedIn, Github, Bitbucket, Twitter and YouTube. If you wanted to reach me via email, I had a personal and professional address, both `@gmail`. This wasn't designed or planned, and had grown out very organically as I stumbled upon products that filled a need at the time.

Thoughts:
* The majority of my public social content on Facebook / Instagram / Twitter was impulsively created and had value to a small group of friends at a specific point in time. I wouldn't want it taken outside that context.

{: .emphasis-panel .indent-1}
> ![Some great old content...](/assets/posts/digital-footprints/old-facebook-status.jpg)
>
> _Gripping stuff._

* There's no 'blended' version of me online. 
  - LinkedIn, Github and Bitbucket capture my work or 'professional' self.
  - Facebook and Instagram hold personal social content, with little to no detail of my work.
  - For all of the above, I feel bound to produce and showcase the type of content the platform is designed to foster; staying true to what other users have signed up to see on that platform.

* My email addresses; the primary point of contact for me and my business, skeleton key to all other digital accounts — not to mention a veritable treasure trove of personal data — were entirely dependant on Google, a company [with][google-inhuman-support-1] [famously][google-inhuman-support-2] [inhuman][google-inhuman-support-3] support.

{: .emphasis-panel .indent-1}
> Locked out of your Google account? The [support site][google-inhuman-support-4] has no obvious way to raise a ticket or call a human, and searching 'locked out' leads to an article about what you should have done _before_ it happened...
>
> ![Google: better not get locked out!](/assets/posts/digital-footprints/google-better-not-get-locked-out.jpg)
>
> _Source: support.google.com at 2020-03-26 18:05_

* My Github/Bitbucket accounts aren't representative of the type or quality of work I do on a day to day basis.

So, lots to work on! Here are a few of the things that I've done since then, starting with the easiest wins.

----

#### Privatising social

Technically, a very straightforward change, and one worth considering for anyone that isn't aiming to become a social influencer or similar. I really can't think of many upsides of publicly sharing a mass of impulsive, sometimes highly contextual content aimed at friends. When you're 16 years old and posting a status to try and get some attention, shaping a permanent online identity probably wasn't at the forefront of your mind!

I could 'clean up' and then leave stripped profiles public, but I think there's still something in old content, for trusted friends and people that knew you in that context. Besides, I want the freedom to keep posting crap and having open interactions that are only funny or valuable for a network of friends – it's a fun part of the internet!

By the above measure, Facebook and Instagram were easy candidates for locking down. A lot of personal information on there with little apparent benefit to keeping it exposed. Twitter was a bit more tricky – my usage was blurred between bantering mates, posting things that interested me personally and professionally, and getting support from companies that need a bit of a push to be helpful. In the end, I decided to put my current account that I had into private mode and leave it at that. If I start using it more again in the future, it would make sense to create a second account to split public and private usage.

#### Building a personal website

I wrote a bit more about my [vision for this website][about-this-site] as a starting post, which includes a few of the gory details about the tech stack – usually not overly important, but for me, the underlying technical decisions (static content, no client-side monitoring or trackers, light page weight, etc) were an important part of the process; a way to show my technical personality before even writing my first post.

This site and blog is my current, evolving answer to being findable, contactable, and having an outlet for mixed content that represents the current 'me'. In time, I hope to also use it to showcase the work that I do, in a bit more detail than just the [cv][cv]. A personal site is something that I was missing before, and I'm really glad that I took some time to set this up.

Note that while I took a tech-centric approach to the setup, something like [Squarespace][squarespace], or a managed [Ghost][ghost] or [Wordpress][wordpress] instance can bring the technical bar down a lot and make owning your personal corner of the web super approachable! If anyone on my network wants to do this but gets a bit stuck on the technical side, [get in touch][get-in-touch]. I'm more than happy to lend a hand.

#### Reducing email dependence

I had a few motivations to get my email away from being totally dependant on Gmail:
* Reading accounts of people that got locked out of their accounts for spurious false reasons, and had a hard time getting back in. I need a backup plan if this happens.
* Not participating in the current mail oligopoly. While setting up new outbound mailing systems for an employer, I found the anti-spam measures employed by the big players to be extremely opaque and devoid of any regulatory accountability. Even with properly configured SPF/DKIM and using clean IP's (not on any public blacklist I could find), messages were being classified as spam, and the limited anti-spam decision making info in the mail headers did not explain why. 
* While I love the spam filtering nous of these free services as a user, being stuck on the other side in this situation was an eye-opener to dangers of email becoming extremely centralised. You shouldn't need to have a Google or Microsoft account to be able to mail their users reliably, and the more we centralise on these providers, the closer we get to this reality.

What to do about it involved a bit of consideration. Popular alternatives [Fastmail][fastmail] and [Protonmail][protonmail] looked appealing, but I ended up going with something a bit custom using [Amazon SES][amazon-ses], which won for me on price, flexibility, and ability to get my hands a little bit dirty whilst abstracting away the more mundane tasks involved with running a mail server. If you're still curious and might want to do something similar, I've put together a [more detailed technical walkthrough here]({% post_url 2020-04-10-my-email-setup-part-1 %}).

With fresh custom emails (primary: daniel@bergam.in, backup daniel@danielbergamin.net) backed by SES, I've gained the following:
* Separation between domain and the email operator. If I ever want to move away from AWS SES, I can move to another email provider without losing the email address, saving the headache of updating a lot of sites and losing a trusted identity.
* Mail files stored in Amazon S3, making it easy to sync with Google Drive, as well as auto-forward to a Gmail address and diversify my mail backup.
* Doing my bit to keep mail decentralised.

{: .emphasis-panel }
> Side note: as part of my archival efforts, I purchased an integrated cloud storage product from Google, 'Google One'. Annual fees start at AUD$25, and as a paying customer, you can actually [get human support from Google][google-human-support]. Simpler than trying to roll your own and migrate, and well worth a look if you heavily depend on their services.

----

That's it for part one! [Later parts][later-parts] will look at building a deeper understanding of our personal use cases, and then a deeper dive into how I leverage the internet to manage and organise private content like photos, messages and passwords. 

[about-this-site]:            {% post_url 2020-02-06-about-this-site %}
[cv]:                         {% link cv.markdown %}
[get-in-touch]:               {% link about.markdown %}
[google-human-support]:       https://one.google.com/support
[google-inhuman-support-1]:   https://support.google.com/adsense/forum/AAAAKDuOfxQ-G-nQgEJdeM
[google-inhuman-support-2]:   https://news.ycombinator.com/item?id=4013799
[google-inhuman-support-3]:   https://www.reddit.com/r/LivestreamFail/comments/dtv9g2/google_issues_account_permabans_for_many_of/
[google-inhuman-support-4]:   https://support.google.com/
[ghost]:                      https://ghost.org/
[squarespace]:                https://www.squarespace.com/
[wordpress]:                  https://wordpress.com/
[amazon-ses]:                 https://aws.amazon.com/ses/
[fastmail]:                   https://www.fastmail.com/pricing/
[protonmail]:                 https://protonmail.com/pricing
[later-parts]:                {% link blog.markdown %}?filters=series%3A%20digital%20footprints