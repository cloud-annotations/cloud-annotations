---
title: Labeling with a team
# date: 1970-01-05
---

To give someone access to your project, you need to set up an Identity & Access Management (IAM) policy.

Navigate to [IBM Cloud](https://ibm.biz/cloud-annotations-dashboard){:target="_blank"}.
From the titlebar, choose `Manage` > `Access (IAM)`.

![](/docs-assets/images/manage-access.png)


## Invite users
Invite the user, by choosing the `Users` sidebar item and clicking `Invite users`.

![](/docs-assets/images/invite-users.png)

Enter their email address, then click `Invite`.

![](/docs-assets/images/add-email.png)


## Create an access group
For Cloud Annotations to work properly, the user will need:
- **Operator platform access**
  - Able to view the service instance in Cloud Annotations
  - Able to generate the credentials needed for training
- **Writer service access** 
  - Able to `View` / `Upload` / `Delete` files in object storage

Create an access group, by choosing the `Access groups` sidebar item and clicking `Create`.

![](/docs-assets/images/access-groups.png)

Give the access group a name.

![](/docs-assets/images/name-access-group.png)

Add the invited user to the access group by clicking `Add users`.

![](/docs-assets/images/add-users-to-access-group.png)

Select the user from the list and click `Add to group`.

![](/docs-assets/images/select-users-from-access-group-list.png)

Choose the `Access policies` tab and click `Assign access`.

![](/docs-assets/images/add-access-policy.png)

Choose `Cloud Object Storage` from the dropdown, this will enable the rest of the options.
For `Service instance`, choose the Cloud Object Storage instance affiliated with you Cloud Annotation project.

For access, choose:
- **Operator**
- **Writer**

Followed by clicking `Add`.

![](/docs-assets/images/choose-policies.png)

Once added, click `Assign`.

![](/docs-assets/images/assign-the-policy.png)

Once assigned, the invited users should automatically be able to see the project in Cloud Annotations. To invite additional users, just add them to the access group you just created.