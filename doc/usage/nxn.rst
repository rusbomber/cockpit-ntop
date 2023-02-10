NxN Interface
=============

NxN is a web-based interface, distributed with the nBox interface, that can be used as centralised control panel to manage multiple boxes running nBox from a single place.

The NxN manager includes a dashboard where you can monitor all your nBox appliances, including all services running on each appliance with informations like the actual traffic boing processed and the disk utilisation. If you are running raw traffic recording on some of the appliances connected to the NxN interface, a wizard can guide you through the steps for running traffic retrieval from all remote boxes, the result is provided in a single centralised place as soon as data is ready

Dashboard
---------

Starting using NxN is quite straightforward, just open your nBox interface running on one of your appliances, and click on the “Manage Remote Boxes” button to switch to the NxN interface.

.. image:: ../img/screenshots/manage_remote.png

When you open the NxN interface for the first time, an empty dashboard is shown. You can use the “Add Box” button to start adding your remote (or local) appliances that you want to manage/monitor.

.. image:: ../img/screenshots/nxn_dashboard_empty.png

Adding a new box is as simple as providing the remote box URL, a name for the box (and optionally also a description), and credentials for authentication. Before adding the box, you should create a new user and key for authentication on the remote box, going to the System -> Users menu of the remote nBox interface.

.. image:: ../img/screenshots/nxn_add_box.png

After configuring a couple of remote appliances, your dashboard should look similar to the one below. You should be able to:

- See all applications (including nProbe, n2disk, ntopng, cento) that have been configured on the remote boxes
- Check the application status, and start and stop the them with the “On” and “Off” buttons
- Check the traffic rate being processed by each application
- Check the disk utilisation for volumes used by n2disk

Each box has a toolbar when you can, in order:

- Check if the box is currently connected to the NxN interface
- Get notified in case some events occur (including license expiration for instance)
- Collapse the box
- Remove the box from the dashboard

.. image:: ../img/screenshots/nxn_dashboard.png

Remote Traffic Extraction
-------------------------

If you are running traffic recording with n2disk on some of the remote appliances, a wizard can help you running traffic extraction from all the remote boxes. This can be done by clicking on the “Search” menu and following a few simple steps a listed below.

1. Select the traffic source

As first step you should select the n2disk instances running on the remote boxes that you want to use as traffic source.

.. image:: ../img/screenshots/nxn_extract_source.png

2. Specify the time interval

As second step, you should select the time interval for the traffic you want to extract,  specifying “from” and “to” date and time.

.. image:: ../img/screenshots/nxn_extract_time.png

3. Specify the filter

As third step, write a traffic filter to reduce the amount of data to be extracted, and speed up the extraction activity (remember to enable indexing and timeline in the n2disk configuration!)

.. image:: ../img/screenshots/nxn_extract_filter.png

4. Select the desired output format

As last step, configure the maximum file size for the PCAP files that the extraction process will generate. 

.. image:: ../img/screenshots/nxn_extract_output.png

At this point you are ready to schedule the extraction by clicking on the "Run Extraction" button. When you run an extraction, the NxN interface schedules the same extraction task to all the remote boxes, and keeps track of this activity. In order to check the status, you should go to the "Activity Log" menu.

Activity Log
------------

The activity log page keeps track of all extraction tasks, with one item for each Extraction-ID/Server/Interface, reporting the current status (scheduled, done, etc) and useful informations including the remote appliance name, the corresponding n2disk instance and the date. By expanding each item you can get additional informations.

.. image:: ../img/screenshots/nxn_activity_log.png

As soon as you schedule an extraction task, the status is marked as “Scheduled”, when It turns into “Done” you are ready to get your extracted data (if any) and download PCAP files following the provided links.

.. image:: ../img/screenshots/nxn_activity_log_detail.png

