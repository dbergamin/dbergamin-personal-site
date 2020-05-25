---
layout: post
author: Daniel Bergamin
author_url: /about.html
title:  "Walkthrough: Wordpress from scratch, using AWS and Cloudflare"
date:   2020-05-19 13:25:55 +1000
categories: tech
---

After a few months maintaining this site, I've found the blogging process very helpful for both keeping my writing sharp, and also getting more mental clarity on the topics I choose to write about.

For me, the process of building the site was a key part of the journey. But for many, the tech is just an incidental problem to be solved in the simplest way possible. When my partner Shelley decided to start [a blog][shelleys-blog], we landed somewhere in the middle – we didn't want to invest quite as much effort in the site build, but the infra-fanatic in me liked the idea of having ownership and control over the hosting, ruling out 'blog-as-a-service' offerings.

A self-hosted Wordpress instance on the AWS free tier ended up being the most attractive option. While doing the setup, I thought I'd document the process and share it here in the hope of making it easier for others who want to do the same. Blogging is a very isolation-friendly exercise, and I'd recommend it to anyone!

A quick note in advance to address some glaring omissions:
1. ~~I've opted for a local database over RDS due to cost. The automated maintenance offered by RDS would make it a sensible choice if cost were no object.~~
  * Update: Thanks to Ravi Soni for pointing out that RDS has a separate Free Tier allowance to EC2, so you get a year free on RDS as well! I am going to update the setup and this post to use RDS in due course.
1. Despite likely being faster to set up initially, I've avoided Docker here, as it adds complexity to ongoing maintenance and troubleshooting. With no major need for isolation and no local development or pipeline, I don't think it pays for itself here. If you've had a good experience using Docker for this use case, please do write about it and reach out, I'm not averse to switching! 

----

{: .light-emphasis-panel}
> This walkthrough goes through the full setup process in moderate detail. It should take 2 - 3 hours to complete in full.
>
> **What you'll need to follow along:**
> * Moderate technical ability and enthusiasm. I'm not going to go to the level of screenshots, so it'll be easier if you have basic familiarity with AWS and general Linux administration.
> * An SSH client. If you're on Windows, [PowerShell should work][ps-ssh] on latest Win10, otherwise, [PuTTY][putty].  
>
> **What you'll get:**
> * At the end of this walkthrough, you'll have your own little corner of the internet to write on.
> * It will be reasonably secure and scalable, for the cost of a domain and a few hours effort.
>
> **Contents:**
> 1. [Getting Wordpress running](#getting-wordpress-running)
> 2. [Using a custom domain](#using-a-custom-domain)
> 3. [Using Cloudflare](#using-cloudflare)
> 4. [Maintenance: patches, updates and backups](#maintenance)
> 5. [SEO basics](#seo-basics)

----

## Getting Wordpress Running

### Provisioning an EC2 server

1. [Register for an AWS account][aws-signup]. If you're like Shelley and don't have one yet, you're eligible to run a small server for up to a year, free of charge. This walkthrough makes full use of the free tier.

1. Once in AWS, navigate to the EC2 service. At the top right, select the region where you'd like your server to be hosted.

1. Once in EC2, navigate to Instances, then create a new instance using the following parameters:
    * Amazon Linux 2 as the operating system.
    * Instance type: t2/t3.micro. The free tier instance type varies by region, so look for the green 'Free Tier Eligible' label.
    * 30GB attached EBS storage, using GP2 (General use SSD storage class).
    * Configure the security group to allow the following:
        + Port 22 from your current public IP, to allow yourself SSH. You could open it to 0.0.0.0/0 with relative safely as we're sticking to key-based auth, but your auth log will be spammed with failed attempts from bots and scanners.
        + Port 80 from your current public IP. We’ll open this one up later, but for now, keep it restricted as we’re going to be launching a Wordpress that requires its initial setup. For a short window, anyone able to connect will be able to create the admin account.
    * Upload your existing public key if you have one, or let Amazon create a new key pair if you don't have one yet.
    * Once the instance is created, right-click on it, Instance Settings > Change Termination Protection and enable Termination Protection. This will help safeguard against a misclick nuking our efforts.

1. In EC2, navigate to the Elastic IP module, and create a new Elastic IP (EIP) from the Amazon pool. Right-click on the EIP and associate it to the instance you've just created.

1. Congratulations - you now have a server, and you're ready to set up Wordpress!

### Install updates and required packages

1. SSH into your new machine using:
~~~
ssh -i your_private_key.pem ec2-user@<Elastic IP you just allocated>
~~~

1. Switch to root:
~~~    
$ sudo su -
~~~

1. Ensure the instance is up to date:
~~~
# yum update
~~~

1. Install the latest and greatest required additional packages for Wordpress. I use PHP7.3 here, but check the [latest supported version][wp-requirements] on the Wordpress site.
    * PHP
    ~~~
    # amazon-linux-extras enable php7.3
    # yum clean metadata
    # yum install php-cli php-pdo php-fpm php-json php-mysqlnd php-dom php-mbstring php-imagick php-gd
    ~~~
    * MariaDB
    ~~~
    $ yum install mariadb mariadb-server
    ~~~
    * Apache Modules
    ~~~
    # yum install httpd mod_ssl
    ~~~
1. Install Wordpress
    ~~~
    # wget https://wordpress.org/latest.tar.gz
    # tar -xzf latest.tar.gz 
    # mkdir -p /var/www/html
    # mv wordpress/* /var/www/html/
    # chown -R apache:apache /var/www
    ~~~

### Prepare the Database

1. First, start MariaDB and enable it for future reboots:
~~~
# systemctl start mariadb.service
# systemctl enable mariadb.service
~~~
1. Now, create the database. Do choose your own password! 
    ~~~
    # mysql -u root -p
    MariaDB [(none)]> CREATE DATABASE wordpress;
    MariaDB [(none)]> CREATE USER 'wp'@'localhost' IDENTIFIED BY 'mypassword';
    MariaDB [(none)]> GRANT ALL PRIVILEGES ON wordpress.* TO 'wp'@'localhost';
    MariaDB [(none)]> FLUSH PRIVILEGES;
    ~~~

### Configure Wordpress

1. Configure Wordpress
    * Create a config:
    ~~~
    # cp /var/www/html/{wp-config-sample.php,wp-config.php}
    ~~~

    * Edit the config:
    ~~~
    # vi /var/www/html/wp-config.php
    ~~~
        * Set the DB user/password based on what we setup in the previous step
        * Generate your unique auth keys/salts using the link in the sample documentation.
        * Please DO read the sample config documentation, and don't skip this!

1. Finally, start and enable Apache:
~~~
# systemctl start httpd
# systemctl enable httpd
~~~

1. Drop out of root and back to ec2-user:
~~~
# exit
~~~

1. Go through the basic Wordpress setup:
    * Point your browser to `http://<your-elastic-ip>` and you should see the WP setup! Create your admin credentials and check out your new site!
    * If it doesn't work, try `curl -v localhost:80` on the EC2 instance to verify that Wordpress is running and the output looks sane.
        * If Apache isn't running, check Apache error logs for hints (try `journalctl -xe`, `systemctl status httpd`, and check logs in `/var/www/httpd/`)
        * If Apache is running, but you can't connect, make sure you entered your current IP correctly for the EC2 security group, and the security group is the one associated with the instance. You can check your current IP at [ip info][ip-info] - it'll show your IP on load.

### Time for a break!

{: .light-emphasis-panel}
> If you've made it this far, well done! At this point, you've got a functional Wordpress and can start writing your posts! They'll only be accessible to you for the time being. When you're ready to start sharing with the world, move on to the next section.

----

## Using a custom domain

If you already have a custom domain, great! If you don't have one yet, you'll need to purchase one from a registrar. We used [Google Domains][google-domains].

Once you've purchased a domain, you have a few options for how you use it. I'm going to consider two here. 
1. Set up an A record pointing to your Elastic IP in your domain registrar console:
    + **\+** Fastest way to get started.
    + **\+** If you use Google domains, you can use some value-adds, like aliasing mail on the new domain to an existing email address.
    + **\+** Less 'moving parts'/complexity, if you're not comfortable or willing to do any troubleshooting.
    + **\-** Less secure, as it's up to you to identify and drop all malicious HTTP/S traffic yourself. Depending on what you use the site for, you may not consider this to be a significant risk.
    + **\-** Less scalable. If you have a post go viral, your server may not cope depending on volume.
    + **\-** Slower page loads for end-users, compared to a CDN.
    + **\-** Potentially more expensive compared to a CDN. AWS charges for egress traffic, and without a caching layer, you may pass the free tier limits.
    + **\-** No ipv6 support. Not an issue now, but might be in the future.

1. Configure your domain in a CDN. I'd currently recommend [Cloudflare][cloudflare] as it has the most comprehensive free offering. If you go down this path, head straight down to the [Using Cloudflare](#using-cloudflare) section.

If you choose to go with the first option:
1. In your registrar console, add an A record for `%mydomain.com%` pointing to your Elastic IP, and a CNAME for `www` pointing to `%mydomain.com%`.
1. If you used Google domains, I'd recommend considering setting up an aliased mailbox using their [mail forwarding feature][google-mail-forwarding].
1. Strongly consider adding free TLS via Lets Encrypt!. Amazon has documented the process [here][letsencrypt-amzn-linux].
1. Loosen up the EC2 security groups you configured to only allow your IP in the first part. For port 80 and 443, create a rule allowing traffic from 0.0.0.0/0.

You should now have your custom domain working. Hello world! As you're not using Cloudflare, skip ahead to the [Maintenance](#maintenance) section.

----

## Using Cloudflare

### Cloudflare setup
1. Sign up for [Cloudflare][cloudflare], and follow through the prompts to request setup for your domain.
1. You'll need to let Cloudflare manage your DNS for it to work properly. You'll need to make an update in your registrar control panel to tell it to use Cloudflare's nameservers. 
1. For DNSSEC users:
    * If you have DNSSEC enabled, you'll need to deal with this first. Enable DNSSEC on Cloudflare to generate the DS records, then add the DS record in your registrar control panel. Cloudflare has published [detailed instructions][cloudflare-dnssec] for many popular registrars.
    * Tell your registrar to set Cloudflare's nameservers as authoritative for your domain. Google should be able to help with more specific instructions for popular registrars if you get stuck.
    * Create the DS record in the Google Domains console using the details provided by Cloudflare.
1. Once the zone is transferred, create an A record for `%mydomain.com%` pointing to your Elastic IP, and a CNAME for www pointing to `%mydomain.com%`.

{: .light-emphasis-panel}
> If you're using Google Domains and want to set up aliasing/forwarding for some mailboxes, set this up BEFORE you transfer the domain. Google Domains disables your ability to interact with this feature and add mailbox aliases after you move the domain away... but if you've already set it up, it continues to work. I wouldn't rely on it for anything important in this state, but it seems OK in a pinch.

Now, we're going to prepare to set up the origin as 'Full (Strict)'. Avoid Cloudflare's Flexible mode here, as it will cause the dreaded 'ERR_TOO_MANY_REDIRECTS' redirect loop. You _could_ work around this [by setting X_FORWARDED_PROTO][wp-reverse-proxy] or using the Cloudflare WP plugin, but it's not much harder to just set up end-to-end TLS.

### Origin TLS / SSL

1. Back to your server. SSH in with:
~~~
ssh -i your_private_key.pem ec2-user@<Elastic IP>
~~~
1. Create a CSR:
~~~
$ mkdir ~/csr && cd ~/csr
$ openssl genrsa -out private.pem 2048
$ openssl rsa -in private.pem -outform PEM -pubout -out public.pem
$ openssl req -new -key private.pem -out certificate.csr
  > Now, fill in the details. Make sure you use your domain for the CN!
~~~

1. In Cloudflare, navigate to the module SSL/TLS > Origin Server. Use 'Create Certificate', copy in your CSR details, and download your fresh Origin Certificate with a convenient 15-year expiry.

1. Now, lets get the new certificate into place:
~~~
$ vi ~/csr/certificate.pem
  '' copy/paste the origin certificate from Cloudflare into here
$ sudo su -
# mkdir /etc/httpd/ssl
# cp /home/ec2-user/csr/* /etc/httpd/ssl
~~~

1. Add the following config. Don't forget to sub my references wrapped with % signs with your own values!
~~~
# vi /etc/httpd/conf.d/%mydomain.com%.conf
'' Add this config block
    ServerTokens Prod
    ServerSignature Off

    <IfModule mod_ssl.c>
      <VirtualHost *:443>
          ServerAdmin %webmaster@mydomain.com%
          DocumentRoot /var/www/html/
          ServerName %mydomain.com%

          <Directory /var/www/html/wordpress/>
              Options +FollowSymlinks
              AllowOverride All
              Require all granted
          </Directory>

          ErrorLog /var/log/httpd/%mydomain%_error.log
          CustomLog /var/log/httpd/%mydomain%_access.log combined

          SSLCertificateFile /etc/httpd/ssl/certificate.pem
          SSLCertificateKeyFile /etc/httpd/ssl/private.pem
      </VirtualHost>
    </IfModule>

    <IfModule mod_headers.c>  
      Header unset X-Powered-By
      Header always unset X-Powered-By
    </IfModule>
'' Save and exit
~~~
*Thanks [@George Gkirtsou][george-site] for feedback on this configuration.

1. Now, back to our EC2 Security Group config on Amazon. We want to configure our origin servers to drop traffic from anyone but Cloudflare and ourselves to reduce the attack surface. 
* If you haven't got your AWS CLI set up (or don't know what this means), it's probably easiest to add the security group (SG) rules manually. Run through the [Cloudflare IPs list][cloudflare-subnets] add them to your SG rules for port 443, and then we're done!
* If you do have a working AWS CLI, you can try [this handy script][add-cf-ranges-to-sg], which will add the Cloudflare IP ingresses to an SG of your choice – you'll just need to set the ID of the SG attached to your Wordpress server. 

1. Back in the Cloudflare control panel, under SSL/TLS, enable Full (Strict) mode.

{: .light-emphasis-panel}
> Milestone! You should now be able to access your new Wordpress at your custom domain, served via Cloudflare. At this point, you can take a bit of a break before we hit the final stretch – putting in the groundwork to automate some of the maintenance, and some final optimisations.

### Securing Admin Pages

There are two simple approaches we can take to locking down our admin pages using Cloudflare. This reduces risk and removes bot scanner garbage from your access logs, so it's worth spending the 10 minutes to get it going.

#### Using Firewall Rules

If you have a static IP for your home connection, I'd suggest creating Firewall Rules to secure `/wp-login.php` and `/wp-admin`.
1. In the CF console, navigate to Firewall > Firewall Rules and create a new rule.
* Field 'URI Path' equals `/wp-login.php`, OR
* Field 'URI Path' equals `/wp-admin*`
* Then Block or Challenge (CAPTCHA), depending on whether you think you'll be updating your site away from home often.
1. Create another rule.
* Field 'IP Address' equals (your home IP)
* Then 'Allow'
1. Make sure the 'Allow' sits ABOVE the 'Block' in the rules list. Rules will stop evaluating once a request hits a match.

{: .light-emphasis-panel}
> Tip: if it doesn't seem to be working, make sure you haven't forgotten to allow your ipv6 address as well.

#### Using Page Rules

If you don't have a static IP at home, constantly making updates in Cloudflare could be a bit of a chore and add friction to writing, which isn't good. In this case, I'd suggest using Page Rules instead.
1. In the CF console, navigate to 'Page Rules' and Create a Page Rule.
* If the URL matches `https://%mydomain.com%/wp-login.php`
* Then set 'Security Level' to 'I'm Under Attack'
1. Add another page rule:
* If the URL matches `https://%mydomain.com%/wp-admin*`
* Then set 'Security Level' to 'I'm Under Attack'

This adds a layer of JS-based browser checking and will foil a large portion of spammers trying to brute force your login page.

----

## Maintenance
### File Permissions
It's always good to have file permissions in order. The following commands should get you into a decent position.
~~~
$ sudo su -
# chown -R apache:apache /var/www/html
# chown root:root /var/www/html/wp-config.php
# find /var/www/html -type d -print0 | xargs -0 chmod 755
# find /var/www/html -type f -print0 | xargs -0 chmod 664
# exit
~~~

### Preparing for WP updates
I've configured WP to use SFTP for updates:
1. Create a new user `wpupdater` and SSH keypair, and put it in place with appropriate permissions. The `apache` user must be able to read the key, and the WP operations will be performed as the wpupdater user.
~~~
[ec2-user]$ sudo su - 
[root]# useradd -d /var/www/html -G apache -s /bin/bash -c "WP Updater" wpupdater
[root]# passwd -d wpupdater
[root]# usermod -g apache wpupdater
[root]# sudo su - wpupdater
[wpupdater]$ ssh-keygen
      ... follow prompts (no passphrase)...
[wpupdater]$ cat ~/.ssh/id_rsa.pub > ~/.ssh/authorized_keys
[wpupdater]$ cp -R ~/.ssh /var/www/html/updater-ssh
[wpupdater]$ exit
[root]# chown -R apache:apache /var/www/html/updater-ssh
~~~

1. Download and install the SSH bindings module for PHP:
~~~
$ sudo su -
# yum install gcc libssh2-devel php-devel php-pear
# pecl channel-update pecl.php.net
# pecl install ssh2-beta
# echo "extension=ssh2.so" > /etc/php.d/20-ssh2.ini
# php-fpm -m | grep ssh2
'' If all went well, the above command should return ssh2
~~~

1. Configure WP to use SFTP:
~~~
sudo vi /var/www/html/wp-config.php
'' Above the "That's all, stop editing" line, add the following lines:
define( 'FS_METHOD', 'ssh2' );
define( 'FTP_BASE', '/var/www/html/' );
define( 'FTP_USER', 'wpupdater' );
define( 'FTP_PUBKEY', '/var/www/html/updater-ssh/id_rsa.pub' );
define( 'FTP_PRIKEY', '/var/www/html/updater-ssh/id_rsa' );
/* That's all, stop editing! Happy publishing. */
~~~

1. Allow WP update hosts to interact with your server. If you're restricting SSH traffic to your personal IP via AWS security groups, you'll need to open it up a little bit here.
* Add an inbound rule:
  * Port 22, source CIDR `54.76.125.19/32`. This is the Wordpress-owned IP that I have observed connecting in to make changes. 
* If updates/plugin/theme operations are timing out, it's likely because WP is using an IP not listed here.
* In this case, open up SSH to `0.0.0.0/0`, check for the connecting IP in `/var/log/secure`, and add it to the inbound rules.
* You may just want to leave SSH open on `0.0.0.0/0`. It should be relatively safe given we are exclusively using key-based auth, although your `/var/log/secure` can get a bit noisy with bots/scanners. Not the worst thing.

1. You should now be able to install themes, plugins and updates easily through the Wordpress admin console!

### Backing up Wordpress
I chose to use the Wordpress backup plugin [UpdraftPlus][updraft-plus]. Install it through WP Admin Console > Plugins > Add New.

* Plugins > Updraft Plus > Settings
  * Set your backup frequency and retention. I used Weekly, storing 3 backups.
  * Configure a remote storage location. I used Google Drive as it is free.
  * After authenticating with your remote, manually take a test backup **and restore it** to verify that it works.

### Keeping your instance patched
Patching is a bit of a chore and easy to forget. Let's automate it using the AWS Systems Manager. Please note that these instructions are best suited for an AWS account that only runs this Wordpress instance.

1. Open up the AWS Console and go to the Systems Manager product. Click through the wizard, creating the default IAM role and targeting all eligible instances to get started. 
1. SSH into your Wordpress instance and run `sudo systemctl restart amazon-ssm-agent.service` to help it get detected faster.
1. Navigate to Systems Manager > Managed Instances, and you should see your instance.
1. Navigate to Systems Manager > Patch Manager and Configure Patching
  * Select your Wordpress instance manually
  * Schedule in a new Maintenance Window
	* Choose the frequency. I opted for 'Every Sunday at 22:30' with a 1-hour window.
  * Choose Scan and Install for the patch operation, and click through to Configure Patching
1. Navigate to Systems Manager > Maintenance Windows
  * There should be a window created by the Patch Manager wizard you just used.
  * Select the maintenance window, and look under the Tasks tab. You should see a task named 'PatchingTask'.

All done. Your instance should stay patched and up to date, largely automatically. You'll still be responsible for keeping your PHP major version up to date, so do ssh in every so often and keep an eye open on your Wordpress 'Site Health' panel.

----

## SEO Basics
I am by no means an SEO expert, and I believe obsessing over views and search rank for your personal writing is counter-productive and demotivating past a certain point. With that said, here are a few simple things that I've found to be helpful.

* Install a Wordpress SEO helper plugin, like [The SEO Framework][seo-framework] or Yoast, and activate features that make sense.
* Register your domain on the [Google search console][google-search-console]. From here, you can request a crawl, make sure you're not being penalised for failing mobile-friendly checks, and more.
* Perform a search for your name in an Incognito session. Take note of any high-ranking links you control (e.g. a LinkedIn or Facebook profile). Where possible, update your profiles in these sites to include a link to an 'About' page on your new Wordpress.

----

To those that made it this far, thanks for following along and I hope you've enjoyed the process! You can contact me via details on the [about page][about-me] with have any constructive feedback, or even just to share some enthusiasm.

[ravi-linkedin]:          https://
[shelleys-blog]:          https://shelleyguo.com/
[putty]:                  https://www.chiark.greenend.org.uk/~sgtatham/putty/
[ps-ssh]:                 https://adamtheautomator.com/ssh-with-powershell/
[aws-signup]:             https://portal.aws.amazon.com/billing/signup#/start
[wp-requirements]:        https://wordpress.org/support/article/requirements/
[ip-info]:                https://ipinfo.io
[google-domains]:         https://google.domains
[cloudflare]:             https://cloudflare.com
[google-mail-forwarding]: https://support.google.com/domains/answer/3251241
[letsencrypt-amzn-linux]: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/SSL-on-amazon-linux-2.html#letsencrypt
[cloudflare-dnssec]:      https://support.cloudflare.com/hc/en-us/articles/360006660072-Understanding-and-Configuring-DNSSEC-in-Cloudflare-DNS#adddsrecord
[wp-reverse-proxy]:       https://wordpress.org/support/article/administration-over-ssl/#using-a-reverse-proxy
[cloudflare-subnets]:     https://www.cloudflare.com/ips/
[add-cf-ranges-to-sg]:    https://gist.github.com/dbergamin/f0c9416b2f89fda6693514f4b741fad6
[ssh-sftp-updater]:       https://en-gb.wordpress.org/plugins/ssh-sftp-updater-support
[updraft-plus]:           https://wordpress.org/plugins/updraftplus/
[george-site]:            https://ggirtsou.com/
[seo-framework]:          https://wordpress.org/plugins/autodescription/
[google-search-console]:  https://search.google.com/search-console/welcome
[about-me]:               /about.html