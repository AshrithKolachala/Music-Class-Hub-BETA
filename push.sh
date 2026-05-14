#!/bin/bash
git remote set-url origin https://x-access-token:${GITHUB_TOKEN}@github.com/AshrithKolachala/Music-Class-Hub-BETA.git
git push -u origin master
git remote set-url origin https://github.com/AshrithKolachala/Music-Class-Hub-BETA.git
echo "Done!"
