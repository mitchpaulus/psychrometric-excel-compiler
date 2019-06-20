BEGIN { FS=OFS="|" }

{
    property = $1
    function_code = $2

    printf("%s_cell = ko.observable(\"\");\n", property)
    printf("%s_use_cell = ko.observable(false);\n", property)
    printf("%s = ko.pureComputed(() => {\n", property)
    printf("return this.%s_use_cell()"



}
