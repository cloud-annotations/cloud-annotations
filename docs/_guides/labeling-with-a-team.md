---
title: Labeling with a team
# date: 1970-01-05
---

To give someone access to your project, you need to set up an Identity & Access Management (IAM) policy.

Navigate to [IBM Cloud](https://ibm.biz/cloud-annotations-dashboard){:target="_blank"}.
From the titlebar, choose `Manage` > `Access (IAM)`.

{% include responsive.html image="manage-access.png" %}

## Invite users
Invite the user, by choosing the `Users` sidebar item and clicking `Invite users`.

{% include responsive.html image="invite-users.png" %}

Enter their email address, then click `Invite`.

{% include responsive.html image="add-email.png" %}


## Create an access group
For Cloud Annotations to work properly, the user will need:
- **Operator platform access**
  - Able to view the service instance in Cloud Annotations
  - Able to generate the credentials needed for training
- **Writer service access** 
  - Able to `View` / `Upload` / `Delete` files in object storage

Create an access group, by choosing the `Access groups` sidebar item and clicking `Create`.

{% include responsive.html image="access-groups.png" %}

Give the access group a name.

{% include responsive.html image="name-access-group.png" %}

Add the invited user to the access group by clicking `Add users`.

{% include responsive.html image="add-users-to-access-group.png" %}

Select the user from the list and click `Add to group`.

{% include responsive.html image="select-users-from-access-group-list.png" %}

Choose the `Access policies` tab and click `Assign access`.

{% include responsive.html image="add-access-policy.png" %}

Choose `Cloud Object Storage` from the dropdown, this will enable the rest of the options.
For `Service instance`, choose the Cloud Object Storage instance affiliated with you Cloud Annotation project.

For access, choose:
- **Operator**
- **Writer**

Followed by clicking `Add`.

{% include responsive.html image="choose-policies.png" %}

Once added, click `Assign`.

{% include responsive.html image="assign-the-policy.png" %}

Once assigned, the invited users should automatically be able to see the project in Cloud Annotations. To invite additional users, just add them to the access group you just created.