Licenses
========

nBox appliances are usually delivered with all the software installed and licensed, thus there is no need for the user to enable the software. If this is not the case, under the Licenses section, users can configure licenses for the applications.
Licensing the software allows the user to update the applications for 1 year since the first registration. After this period applications will continue to run but any further update cannot be installed.

The Licenses section contains three pages, a Wizard for automatically configure the system with all the needed licenses providing an order ID, a Configuration page where the user has to manually insert licenses for all the needed applications, and a Maintenance section where software maintenance expiration status is reported.

.. image:: ../img/screenshots/licenses.png

Using the Wizard page, after inserting email and order ID, selecting the needed application, and pressing the “Generate Licenses” button, the nBox automatically generates licenses. It is possible to retrieve those licenses in the Configuration page.

.. image:: ../img/screenshots/licenses_wizard.png

In the Configuration page is possible to retrieve or add licenses for the nBox components: ntopng, nProbe, nProbe plugins, nProbe Cento, n2disk, ZC. Licenses are based on System ID (for ntopng, nProbe, nProbe plugins, nProbe Cento, n2disk) or MAC address (for PF_RING ZC).

The first page in the Configuration page displays the System ID. On the other tabs, users can add their licenses as in the nProbe example below, where the application version and the system ID are displayed. Users will find the license field already filled with their licenses if present, or it can be reinstalled if needed.

.. image:: ../img/screenshots/licenses_configuration.png

nProbe can be extended using nProbe plugins. They improve traffic decoding and storing features and are available for purchase on the ntop shop. Plugins come in single license (e.g. DNS plugin) or in bundle license (e.g. VoIP that contains both RTP and SIP plugins).

n2disk is licensed based on speed. This way the user can reduce costs acquiring only the license for the required capture speed. Different flavours are for 1 Gbit/s, 5 Gbit/s and 10 Gbit/s. Please note that a 10 Gbit/s license does not guarantee wire speed capture unless on top of adequate hardware.

Unlike the applications, ZC drivers licensing model is on a per-MAC-address basis, hence each network interface that supports this kind of technology might be enabled using a different license. 
In the same way as nProbe plugins, ZC licenses can be purchased upon user request and added to the nBox during its life cycle.
The ZC technology extends and increases the packet capture and forward-to-application speed, giving each captured packet available to user application without extra copies from and to the memory.

In the Maintenance page is reported the status of the software maintenance, showing the number of days left to expiration for each installed product. 

.. image:: ../img/screenshots/maintenance.png

