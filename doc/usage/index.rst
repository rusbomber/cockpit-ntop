Usage Guidelines
================

Starting using nBox is very simple. Startup the box, plug an Ethernet cable to its management interface and connect it to a network. From another PC open a web browser and visit http://192.168.160.10/ (the default IP address of your nBox).

Clicking on the login button the system will ask for credentials as follows:

.. image:: ../img/screenshots/login.png

The default nBox configuration is the following:
- IP address 192.168.160.10
- Default SSH user is "nbox" with password "nbox"
- Default Web user is "nbox" with password "nbox"
IP address and web users can be changedmanaged using the web interface.

.. image:: ../img/screenshots/auth.png

Upon the completion of the login process, the user is redirected to the dashboard page where most valuable informations are shown. CPU, memory, storage and network interfaces state indicators are displayed and updated in real time.

.. image:: ../img/screenshots/dashboard.png

The page header displays the main characteristics of the nBox: running kernel, CPU type and number of CPU cores, RAID controller type, installed network cards, media types and link status.

.. image:: ../img/screenshots/interface_model.png

More information are provided via tooltips on the interface port as shown below:

.. image:: ../img/screenshots/interface_info.png

Each nBox web page comes in a three section format: header, where a menu bar is available to jump from a single configuration page to all the others quickly, the body, where the most important fields are displayed, and the footer, with additional infos. The web interface requires a javascript-enabled browser.

.. toctree::
    :maxdepth: 2
    :numbered:

    system
    ssl
    licenses
    applications
    admin
    nxn
