Get Started
===========

Installing the nBox UI is as simple as configuring our repository following the instructions
at http://packages.ntop.org and installing the **nboxui** package.

Debian/Ubuntu
~~~~~~~~~~~~~

.. code-block::

   apt install nboxui

RedHat/Rocky Linux
~~~~~~~~~~~~~~~~~~

.. code-block::

   yum install nboxui
   systemctl enable --now cockpit.socket

After installing the package, it is possible to access the GUI connecting to the 
machine's IP address using a browser on port 9090 (e.g. http://192.168.1.1:9090).

Source Code
~~~~~~~~~~~

The source code of the nBox UI is available on GitHub at https://github.com/ntop/cockpit-ntop
Feel free to contribute to the project sending patches as Pull Requests on GitHub.
