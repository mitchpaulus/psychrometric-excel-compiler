BEGIN { FS=OFS="|" }
{
    property = $1
    var_name = $2

    type = $3

    if (type == "1") {
        printf("<div class=\"property-row\">\n")
        printf("<div><label>%s in cell?</label><input type=\"checkbox\" data-bind=\"checked: %s.use_cell\" /> </div>\n", property, var_name)
        printf("<div><label>%s</label><span class=\"formula\" data-bind=\"text: '=' + %s.value()\"></span></div>\n", property, var_name)
        printf("</div>\n\n")
    } else {

    }
}
