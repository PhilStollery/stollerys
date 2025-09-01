---
date: 2018-02-12T18:00
tags: [2018, azure, visual studio]
authors: pstollery
---

# Azure Data Lake Analytics

Found #bug with executing [USQL](https://msdn.microsoft.com/en-us/azure/data-lake-analytics/u-sql/u-sql-language-reference) in a Visual Studio Solution. <!-- truncate -->If you have multiple projects, you need to set the project with the script you want to run as the [Startup project](https://msdn.microsoft.com/en-us/library/a1awth7y.aspx), otherwise VS runs the last USQL script you opened.

[VS 2017 V15.5.6](https://aka.ms/upgradevs2017).