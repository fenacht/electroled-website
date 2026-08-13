# ELECTROLED LLC Website — automatic contact form

This version uses a Cloudflare Worker endpoint at `/api/contact` and Resend to email quote requests directly to `support@electroledllc.net`.

## Required Cloudflare secret

Create a Worker secret named:

`RESEND_API_KEY`

Paste your Resend API key as the value.

## Required Resend sending domain

Add and verify:

`forms.electroledllc.net`

The Worker sends from:

`ELECTROLED Website <website@forms.electroledllc.net>`

Do not enable receiving/MX for this Resend subdomain unless you specifically need it. Your existing `support@electroledllc.net` mailbox remains the destination.

## Site structure

Static files live under `public/`.
Worker code lives in `src/index.js`.
