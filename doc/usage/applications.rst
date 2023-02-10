Applications
============

The Application menu allows the user to customise and control all the ntop applications installed and licensed.

.. image:: ../img/screenshots/applications.png

Applications include ntopng, nProbe, n2disk, disk2n. The cluster is also part of the applications and it is used to load balance traffic across application instances, or to send the same traffic to multiple application instances (or combinations of both). The Utility section contains the nBox Activity Scheduler, which is used with n2disk for scheduling traffic extractions.

ntopng
------

The ntopng menu can be used to configure and enable the ntopng application. The page is provided to the user in a tabbed form, where its first tab is the status page for the application, used to start and stop it, while through the configure tab it is possible to customise ntopng directly from the web interface.
A page with the same structure is available for all the applications.

A grey box with the interface name is displayed in the status tab for each enabled instance. The presence of the grey box means that at least an instance of the application is configured. A button On/Off is available to start and stop the instance.

.. image:: ../img/screenshots/ntopng_status.png

In the configuration tab, the user can select the automatic startup for ntopng, to automatically start upon reboot, and the interface where ntopng will listen for incoming packets. All the physical interfaces will be prompted to user, but also a “Collector only” can be chosen. This selection is normally used when ntopng is used as a Netflow collector, in this case ntopng does not need to capture packets directly from the network card.

.. image:: ../img/screenshots/ntopng_configuration.png

Many other settings are available through the configuration page, such as DNS resolution mode, local network subnets, etc. After configuring the ntopng instance, the “Save” button allows to store the configuration. Please note that is is not possible to change a configuration while the application instance is running.

nProbe
------

The nProbe menu also contains several option that can be tweaked by the user. As in the ntopng menu, the nProbe configuration page is available in tabs. The first is the status tab and the following are configurations for each available network interface. The last one is for the Netflow proxy configuration.
Several sections permit the customisation of nProbe for example in terms of flow export type and policy, disk based flow dump or database based flow dump. Some sections are dedicated to the customisation of some plugins.

.. image:: ../img/screenshots/nprobe_configuration_dump.png

Use the "Save Changes" button on the bottom of the page to commit changes as in all other pages. nBox gives to the user the ability to easily clone configuration among all the available interfaces using the “Clone from” button and selecting the configuration source.
Please refer to the nProbe user manual for further informations about the nProbe configuration.

n2disk
------

The n2disk section can be used to customise the configuration of n2disk, a network traffic recording application. It is possible for instance to set buffer and PCAP file size, snapshot length, CPU affinity, and so on. The figure below displays all the configurable sections.

.. image:: ../img/screenshots/n2disk_configuration.png

disk2n
------

The disk2n section can be used to customise the configuration of the traffic replay application, used to reproduce traffic recorded with n2disk. In this section, user can show the disk2n instance configured or create a new one using the "+" tab.

.. image:: ../img/screenshots/disk2n_new.png

In the instance configuration tab, the user can tweak disk2n parameters such as egress interfaces, timeline path, source traffic time interval, buffer size, CPU affinity. The figure below displays the configurable sections. 

.. image:: ../img/screenshots/disk2n_configuration.png

Activity Scheduler
------------------

The Activity Scheduler is a tool used to schedule  tasks such as traffic extractions from the n2disk storage.

.. image:: ../img/screenshots/activity_scheduler.png

In this section, the user can see all the scheduled tasks, retrieve the log, the PCAP files extracted, the task configuration, or delete a  task and the corresponding files.
The user can create a new extraction task from an existing n2disk instance using the Extract button in the n2disk status page.
Interfaces, task priority, time interval, bpf filter, output directory are some of the options available

.. image:: ../img/screenshots/extract_packet.png

