BEGIN { FS=OFS="|"; indent="                                   " }
{
    property = $1;
    var_name = $2;

    type = $3;
    unit = $4;

    if (unit != "") {
        formatted_unit = sprintf(" (%s)", unit);
    }
    else {
        formatted_unit = "";
    }

    # 1 = Computed type
    if (type == "1") {
        printf("%s<div class=\"property-row\">\n", indenter(2));
        printf("%s<div><label>%s in cell?</label><input type=\"checkbox\" data-bind=\"checked: %s.use_cell\" /></div>\n", indenter(3), property, var_name);
        printf("%4$s<div>\n%5$s<label>%1$s%3$s</label>\n%5$s<input data-bind=\"visible: %2$s.use_cell, textInput: %2$s.cell\" />\n", property, var_name, formatted_unit, indenter(3), indenter(4));
        printf("%2$s<span class=\"formula\" data-bind=\"visible: !%1$s.use_cell(), text: '=' + %1$s.value()\"> </span>\n", var_name, indenter(4));
        printf("%s</div>\n", indenter(3));
        printf("%s<div><button onclick=\"copyToClipboard('=' + viewModel.%s.value())\">Copy to Clipboard</button></div>\n", indenter(3), var_name);
        printf("%s</div>\n\n", indenter(2));
    } else {
        printf("%s<div class=\"property-row\">\n", indenter(2));
        printf("%s<div><label>%s%s</label><span class=\"formula\" data-bind=\"text: '=' + %s()\"></span></div>\n", indenter(3), property, formatted_unit, var_name);
        printf("%s<div><button onclick=\"copyToClipboard('=' + viewModel.%s())\">Copy to Clipboard</button></div>\n", indenter(3), var_name);
        printf("%s</div>\n\n", indenter(2));
    }
}

# Indenter: function to easily add the proper amount of spaces for
# indentation.
# l: indendation level (1, 2, etc.)
function indenter(l) {
    return substr(indent, 0, l * 4);
}
