
# Batch download

This tool lets you traverse over an arbitrary number of levels of urls, regex-matching
pages and files to download.

Configure base url and regexes in yaml file.

## Features

* Traverse hierarchy of pages / urls
* Match links and files to download with regexes
* Named capture groups store variables (to be used for next fetch or in template)
* Use nunjucks templates to generate file names from variables

# How to YAML

Tasks contain *name*, *regex* and either a *tasks* array or a *file*:
* name is the key the variables of the named capture groups will be assigned to.
* regex will be matched to the body of the url specified by the parent's match results. Named capture groups can be used to:
  - indicate the url for the next file to process or the file to download and save.
  - store variables to be used in template.
* tasks contain further tasks to process on the body of the matched url.
* file is a templated string generating the path where the file will be saved.
