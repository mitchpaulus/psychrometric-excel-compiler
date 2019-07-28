/psy\.js/ {
    printf("<script type='text/javascript' defer>\n");
    system("cat psy.js");
    printf("\n</script>\n");
    next;
}
{ print }
