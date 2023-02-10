System
======

The System menu presents to the user a submenu where he can choose the section to configure.

.. image:: ../img/screenshots/system_menu.png

General
-------

The General section contains the information about the hostname, the system timezone, the NTP and the SSH services, as displayed in the following picture:

.. image:: ../img/screenshots/general.png

All of those values can be changed by the user and saved into the system using the “Save Changes” button. On a successful save. a green boxed message is returned on top of the page.

Users
-----

The Users section should be used to control accesses to the system, managing web users. On listed users, the administrator can perform some actions such as removing or changing password, or create a new one.

.. image:: ../img/screenshots/users.png

If you loose your password for the administrator ('nbox' user by default), you can reset it with the below command: 

.. code-block:: console

   htpasswd -b /etc/nbox/.htpasswd 'nbox' 'nbox'


Network
-------

.. image:: ../img/screenshots/management.png

It is possible to switch from the management interfaces to the other available network interfaces using the tabbed view.

The Management tab gives the possibility to change the management ip address, using either static ip or DHCP. User can also add to the primary network interface a secondary address (Interface Alias).
By default network routing through the available interfaces is disabled, but its status can  also be changed on this page.
Custom DNS server could be specified by the user.

For all the other network interfaces available on the system, the user can decide to use them as management or just configure an address on some of them.

.. image:: ../img/screenshots/eth1.png

WiFi
----

In case a WiFi card is installed into the box, nBox creates a default configuration with the settings below:

SSID: nbox
Channel: 1
Authentication: wpa/wpa2
Password: nbox_passwd

Please note that no DHCP server is configured. Running ntopng it is possible to bridge the Wireless interface to an Ethernet interface, using an external device (i.e. router) for assigning IPs to the WiFi clients. 
The WiFi section allows the user to change the wireless configuration, including SSID, Authentication type and password.

.. image:: ../img/screenshots/wifi_configuration.png

PF_RING
-------

The PF_RING section in the System menu lets the user configure the packet capture framework, including kernel module and Zero-Copy drivers.

.. image:: ../img/screenshots/pf_ring.png

As in the other pages, “Save Changes” is needed to commit any changes, however a reboot is required to make sure changes take effect.

The PF_RING configuration contains the Enable/Disable button to set automatic startup and module load upon system boot, and the number of ring slots (i.e. buffer size) to be used for packet capture using vanilla drivers.

The ZC section can be used to enable or disable the Zero-Copy drivers, if licensed, on each network card with the exception of the management interface. The number of slots for RX and TX rings and the number of RSS (Receive Side Scaling) queues for hw hashing/load balancing can be chosen.

Hugepages
---------

nBox can exploit the advantage of using big memory pages in order to optimise performance in packet processing configuring HugePages.

The Hugepages section allows the user to configure and load the requested number of hugepages, selecting the number of pages and committing using "Save Changes".

.. image:: ../img/screenshots/hugepages.png

CloudShark
----------

nBox is also integrated with Cloudshark, which is similar to Wireshark for the cloud. Configuring the Cloudshark section it is possible to analyse and share PCAPs with CloudShark appliances.

.. image:: ../img/screenshots/cloudshark.png

Configuration Backup
--------------------

The Manage Configuration section is useful for:

- Backing up the system configuration

.. image:: ../img/screenshots/backup.png

- Restoring a system configuration previously stored

.. image:: ../img/screenshots/restore.png

- Creating a system snapshot to provide to the technical support in case assistance is needed. This way the support team has all the needed information to reproduce the issue and help the user as fast as possible.

.. image:: ../img/screenshots/assistance.png

It is also possible to reset the system to factory defaults using the Factory Reset section. This is useful for instance in case the nBox doesn't work because of a wrong configuration.
Please note this also cleans all the licenses, thus please backup them before resetting the system using the Manage Configuration section or manually using the Licenses Configuration section.

.. image:: ../img/screenshots/factory_reset.png

