# Oracle Always Free deployment

Prepared configuration; no Oracle VM has been created by adding these files.
Use a single Ubuntu 24.04 VM in the account's home region. Select a shape and
boot volume explicitly labelled Always Free in the console, within the account's
current allowance. Prefer available Ampere capacity with at least 2 GB RAM;
the 1 GB AMD micro can struggle to build. Do not select paid upgrades as a
capacity workaround. Oracle may reclaim idle instances; keep off-VM backups.

## Provisioning

Create a public subnet and VM with an SSH public key. Keep the private key on
your computer. Restrict SSH ingress to your own IP; allow public TCP 80/443 for
the website. Do not expose port 3000 in the OCI security list or host firewall.
Use a domain you control pointing to the VM public IP. Account verification,
card entry and terms acceptance must be completed by the account owner.

## Installation (SSH into Ubuntu)

Install Node 22 LTS from a trusted package source, verifying `node --version`.
The service expects `/usr/bin/node`; adjust ExecStart if installed elsewhere.

```sh
sudo apt update
sudo apt install -y git nginx sqlite3 certbot python3-certbot-nginx build-essential
sudo useradd --system --home /opt/raghvyonacademy --shell /usr/sbin/nologin academy
sudo git clone https://github.com/partnersdejoiy-hash/raghvyonacademy.git /opt/raghvyonacademy
sudo chown -R academy:academy /opt/raghvyonacademy
sudo install -d -o academy -g academy -m 700 /var/lib/raghvyonacademy
cd /opt/raghvyonacademy
sudo -u academy npm ci
sudo -u academy npm run build
sudo install -m 600 /dev/null /etc/raghvyonacademy.env
sudoedit /etc/raghvyonacademy.env
```

Set these privately in that file, using systemd EnvironmentFile syntax (no
`export`). Never paste passwords, OAuth secrets or private SSH keys into chat.

```ini
NODE_ENV=production
PORT=3000
DATA_DIR=/var/lib/raghvyonacademy
DATABASE_PATH=/var/lib/raghvyonacademy/raghvyon.db
APP_URL=https://YOUR_DOMAIN
ADMIN_EMAIL=deepak.sharma@dejoiy.com
ADMIN_PASSWORD=SET_PRIVATELY
SESSION_SECRET=SET_RANDOM_SECRET_PRIVATELY
GOOGLE_CLIENT_ID=SET_PRIVATELY
GOOGLE_CLIENT_SECRET=SET_PRIVATELY
RAZORPAY_KEY_ID=SET_TEST_KEY_PRIVATELY
RAZORPAY_KEY_SECRET=SET_TEST_SECRET_PRIVATELY
```

Generate SESSION_SECRET with `openssl rand -hex 32`; keep a secure copy with
your backups. It also protects saved OAuth tokens. Do not rotate it casually.
Configure Google HTTPS callback URLs listed in ACADEMY_SETUP.md.

```sh
sudo install -m 644 deploy/oracle/academy.service /etc/systemd/system/academy.service
sudo cp deploy/oracle/nginx.conf /etc/nginx/sites-available/academy
sudoedit /etc/nginx/sites-available/academy
sudo ln -s /etc/nginx/sites-available/academy /etc/nginx/sites-enabled/academy
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d YOUR_DOMAIN
sudo systemctl daemon-reload
sudo systemctl enable --now academy
sudo systemctl status academy --no-pager
curl -I https://YOUR_DOMAIN
```

Replace the nginx placeholder and YOUR_DOMAIN with the same actual hostname.
Configure host firewall as well as OCI ingress without removing existing SSH
access. Test HTTPS, admin sign-in, student/parent isolation, Google connections
and Razorpay test checkout before collecting real fees. The GitHub Pages URL
continues to be a static preview; use the new HTTPS URL for the full app.

## Daily backup

```sh
sudo install -m 700 deploy/oracle/backup.sh /usr/local/sbin/academy-backup
sudo /usr/local/sbin/academy-backup
echo '20 2 * * * root /usr/local/sbin/academy-backup' | sudo tee /etc/cron.d/academy-backup
```

This retains 14 days of local SQLite snapshots. Copy snapshots AND the protected
environment file to secure storage outside this VM. Local snapshots alone do
not protect against instance/volume loss. To restore: stop academy, preserve
existing database/WAL/SHM files elsewhere, install a verified snapshot as the
database owned by academy, restore its matching SESSION_SECRET, then restart.

## Updates

Back up first, pull only the reviewed main branch, run `npm ci` and
`npm run build` as academy, then `sudo systemctl restart academy`. Data lives
outside the checkout. Inspect `sudo journalctl -u academy` if startup fails.
