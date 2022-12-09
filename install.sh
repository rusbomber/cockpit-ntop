#!/bin/bash

# Build
npm run build || exit

# Install
rm -rf /usr/share/cockpit/ntopng
mkdir /usr/share/cockpit/ntopng
cp -r branding/* /usr/share/cockpit/branding/ubuntu/
cp -r plugins/ntopng/* /usr/share/cockpit/ntopng/ 
cp -r dist/* /usr/share/cockpit/ntopng/
