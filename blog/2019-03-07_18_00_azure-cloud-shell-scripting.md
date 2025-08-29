---
date: "2019-03-07T18:00"
tags: [azure, bash]
authors: pstollery
---

# Azure Cloud Shell scripting

I want to store the Resource Group name in a variable to use in a bash script.
<!-- truncate -->
```bash
RgName=`az group list --query '[].name' --output tsv`
```

The ` back tick is important — as it executes the command inside. Or just found out you can use:

```bash
RgName=$(az group list --query '[].name' --output tsv)
```
