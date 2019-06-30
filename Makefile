all : index.html

index.html : index-base.html psy.js
	awk -f replace-psy.awk index-base.html > index.html

psy.js : psy.ts
	tsc

clean :
	rm psy.js index.html
