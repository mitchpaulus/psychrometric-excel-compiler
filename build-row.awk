BEGIN { FS=OFS="|"; indent="    " }
{
    property = $1
    var_name = $2

    type = $3
    unit = $4

    if (unit != "") {
        formatted_unit = sprintf(" (%s)", unit)
    }
    else {
        formatted_unit = ""
    }

    if (type == "1") {
        printf("      <div class=\"property-row\">\n")
        printf("          <div><label>%s in cell?</label><input type=\"checkbox\" data-bind=\"checked: %s.use_cell\" /> </div>\n", property, var_name)
        printf("          <div><label>%1$s%3$s</label>\n         <input data-bind=\"visible: %2$s.use_cell, textInput: %2$s.cell\" />\n", property, var_name, formatted_unit)
        printf("              <span class=\"formula\" data-bind=\"visible: !%1$s.use_cell(), text: '=' + %1$s.value()\"> </span>\n     </div>\n", var_name)
        printf("      </div>\n\n")
    } else {
        printf("      <div class=\"property-row\">\n")
        printf("          <div><label>%s%s</label><span class=\"formula\" data-bind=\"text: '=' + %s()\"></span></div>\n", property, formatted_unit, var_name)
        printf("      </div>\n\n")
    }
}
