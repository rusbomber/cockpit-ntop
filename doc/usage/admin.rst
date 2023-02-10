Admin
=====

The admin section allows the user to manage running services, storages, updates and shutdown or reboot the machine.

.. image:: ../img/screenshots/admin.png

In the Services page system services can be started, stopped or restarted simply toggling the On/Off button.

.. image:: ../img/screenshots/services.png

The system can be updated to latest available packages using the Update section, or in case of maintenance or if necessary, it can be remotely powered off or rebooted using the specific Reboot and Shutdown menus. The ntop software nBox is in continuous development, new feature and bug fixes are out every day. 

If you have an old nBox which is missing the Update button and want to update it, connect to the system via SSH

Default:

- IP address: 192.168.160.10 
- User: nbox
- Password: nbox

and run the following commands:

.. code-block:: console

   sudo apt-get update
   sudo apt-get upgrade

After updating your nBox, you can find the "Update" button in the Admin menu for future updates.


