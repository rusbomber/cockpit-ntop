SSL Certificate
===============

The nBox GUI has SSL enabled on port 443 by default. A self-signed certificate
is installed by the package, however it is a good practice to create your own 
certificate.

The SSL certificate for nBox is installed under /etc/ssl/{certs,private} as
you can see from the Apache configuration file:

.. code-block:: text

   SSLCertificateFile    /etc/ssl/certs/nbox.crt
   SSLCertificateKeyFile /etc/ssl/private/nbox.key

Generate a New Certificate Using OpenSSL
----------------------------------------

In order to generate a new certificate:

1. Log in to your server via your terminal client (ssh)

.. code-block:: console

   ssh nbox@192.168.160.10

2. Generate certificate files

.. code-block:: console

   openssl req –new –newkey rsa:2048 –nodes –keyout server.key –out server.csr

3. Move certificate files under /etc/ssl/{certs,private}
   
.. code-block:: console

   sudo mv server.csr /etc/ssl/certs/nbox.crt
   sudo mv server.key /etc/ssl/private/nbox.key

4. Restart Apache

.. code-block:: console

   sudo apachectl stop
   sudo apachectl start
