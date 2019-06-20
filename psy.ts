/// <reference path="knockout.d.ts" />
const xwxda: string = "0.621945";

const c8:  string = "-1.0440397e4";
const c9:  string = "-1.129465e1";
const c10: string = "-2.7022355e-2";
const c11: string = "1.289036e-5";
const c12: string = "-2.4780681e-9";
const c13: string = "6.5459673";

class PsychrometricFormulas {
    w_pv_pt(pv: string, pt: string) {
        return `${xwxda}*(${pv})/((${pt})-(${pv}))`;
    }

    // t: formula for temperature in °F
    satPress(t: string) {

        var tR = `(${t} + 459.67)`;
        var exp = `${c8}/${tR} + ${c9} + ${c10}*${tR} + ${c11}*${tR}*${tR} + ${c12}*${tR}*${tR}*${tR} + ${c13}*LN(${tR})`;

        return `EXP(${exp})`;
    }

    h_t_w(t: string, w: string) => `0.24*(${t}) + (${w})*(1061 + 0.444*(${t}))`;

    // Derivative of saturated pressure w.r.t. temperature
    // t: formula for temperature in °F
    dpv_dt(t: string) {
        var tR = `((${t}) + 459.67)`;
        return `(${this.satPress(tR)}) * (${-c8}/(${tR}*${tR}) + ${c10} + 2*${c11}*${tR} + 3*${c12}*${tR}*${tR} + ${c13}/${tR})`;
    }

    tdp_pv(pw: string) {

        var alpha = `LN(${pw})`;

        var above32 = `100.45 + 33.193*${alpha} + 2.319*${alpha}*${alpha} + 0.17074*${alpha}*${alpha}*${alpha} + 1.2063*((${pw})^0.1984)`;

        var below32 = `90.12 + 26.142*${alpha} + 0.8927*${alpha}*${alpha}`;

        return `IF((${above32}) > 32, ${above32}, ${below32})`;
    }

    v_t_w(t: string, w: string, pt: string) {
        return `0.370486*((${t}) + 459.67) * (1 + 1.607858*(${w}))/(${pt})`;
    }


    w_t_twb(t: string, twb: string, pt: string) {

        var sat_w_twb = `${this.w_pv_pt(this.satPress(twb), "14.696")}`;

        var above32 = `((1093-0.556*(${twb}))*(${sat_w_twb}) - 0.24*((${t}) - (${twb}))) / (1093 + 0.444 * (${t}) - (${twb}))`;

        return above32;
    }

    // Derivative of saturated humidity ratio w.r.t. wet bulb temperature
    dws_dtwb(twb: string, pt: string) {
        var pws_twb = this.satPress(twb);
        var dpws_dtwb = this.dpv_dt(twb);
        var numerator = `(${pt} - (${pws_twb}))*(${dpws_dtwb}) + (${pws_twb})*(${dpws_dtwb})`;

        var denominator = `(${pt} - (${pws_twb}) )*(${pt} - (${pws_twb}) )`

        return `${xwxda} * (${numerator}) / (${denominator})`;
    }

    // See post on how to calculate wet bulb temperature for description
    // of what I'm calling the 'z' function.
    dz_dtwb(t: string, twb: string, pt: string) {
        var sat_w_twb = `${this.w_pv_pt(this.satPress(twb), "14.696")}`;

        var N = `((1093 - 0.556*(${twb})) * (${sat_w_twb}) - 0.24 * (${t} - (${twb})))`;
        var D = `(1093 + 0.444*${t} - (${twb}))`;
        var dN_dtwb = `((1093 - 0.556*(${twb}))*(${this.dws_dtwb(twb, pt)}) - 0.556*(${sat_w_twb}) + 0.24)`
        return `(${D}*${dN_dtwb} + ${N}) / (${D}*${D})`;
    }
}


class ComputedProperty {

    use_cell = ko.observable(false);
    cell: ko.Observable<string>;

    value: ko.PureComputed<string>

    constructor(computedFunction: () => string, initial_cell: string) {
        this.value = ko.pureComputed(() => {
            return this.use_cell() ?
                this.cell() :
                computedFunction();
        });

        this.cell = ko.observable(initial_cell);
    }
}

class viewModel {

    psy = new PsychrometricFormulas();

    drybulb = ko.observable("A1");
    rh = ko.observable("B1");

    pws = new ComputedProperty(() => this.psy.satPress(this.drybulb()), "C1");
    pw  = new ComputedProperty(() => `(${this.rh()}*${this.pws.value()})`, "D1");
    w   = new ComputedProperty(() => this.psy.w_pv_pt(this.pw.value(), "14.696")  , "E1");
    h   = ko.pureComputed(()      => `${this.psy.h_t_w(this.drybulb(), `(${this.w.value()})`)}`);
    tdp = ko.pureComputed(()      => this.psy.tdp_pv(`(${this.pw.value()})`));
    v   = ko.pureComputed(()      => this.psy.v_t_w(this.drybulb(), this.w.value(), "14.696"));

    constructor() {

    }
}

function ready(fn: any) {
  if ((document as any).attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(() => { ko.applyBindings(new viewModel()); });

