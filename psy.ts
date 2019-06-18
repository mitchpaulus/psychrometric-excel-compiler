/// <reference path="knockout.d.ts" />
const xwxda: string = "0.621945";

const c8: number = -1.0440397e4;
const c9: number = -1.129465e1;
const c10: number = -2.7022355e-2;
const c11: number = 1.289036e-5;
const c12: number = -2.4780681e-9;
const c13: number = 6.5459673;

class PsychrometricFormulas {
    w_pv_pt(pv: string, pt: string) {
        return `${xwxda}*(${pv})/((${pt})-(${pv}))`;
    }

    // t: formula for temperature in °F
    satPress(t: string) {

        var tR = `((${t}) + 459.67)`;
        var exp = `${c8}/${tR} + ${c9} + ${c10}*${tR} + ${c11}*${tR}*${tR} + ${c12}*${tR}*${tR}*${tR} + ${c13}*LN(${tR})`;

        return `EXP(${exp})`;
    }

    h_t_w(t: string, w: string) {
        return `0.24*(${t}) + (${w})*(1061 + 0.444*(${t}))`
    }

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

class viewModel {

    psy = new PsychrometricFormulas();

    drybulb = ko.observable("A1");
    rh = ko.observable("B1");

    pws_cell = ko.observable("C1");
    pws_use_cell = ko.observable(true);
    pws = ko.pureComputed(() => {
        return this.pws_use_cell ?
            this.pws_cell() :
            this.psy.satPress(this.drybulb());
    });

    pw = ko.pureComputed(() => {
        return `(${this.rh()}*${this.pws()})`
    });

    w_cell = ko.observable("C1");
    w_use_cell = ko.observable(true);
    w = ko.pureComputed(() => {
        return this.w_use_cell() ?
            this.w_cell() :
            this.psy.w_pv_pt(this.pw(), "14.696");
    });

    h = ko.pureComputed(() => {
        return `${this.psy.h_t_w(this.drybulb(), `(${this.w()})`)}`
    });

    tdp = ko.pureComputed(() => {
        return this.psy.tdp_pv(`(${this.pw()})`);
    });

    v = ko.pureComputed(() => {
        return this.psy.v_t_w(this.drybulb(), this.w(), "14.696");
    });

    twb = ko.pureComputed(() => {
        debugger;
        if (!this.w_use_cell()) return "Cannot calculate without ω cell."

        var twbGuesses: string[] = [];

        twbGuesses[0] = `(${this.drybulb()} - 10)`;
        for (let i = 1; i < 4; i++) {
            var prevIteration = `(${twbGuesses[i - 1]})`
            var num = `((${this.psy.w_t_twb(this.drybulb(), twbGuesses[i - 1], "14.696")}) - (${this.w()}) )`;
            var denom = `( ${this.psy.dz_dtwb(this.drybulb(), twbGuesses[i - 1], "14.696")} )`;

            twbGuesses[i] = `${prevIteration} - (${num}/${denom})`
        }

        return twbGuesses[3];
    });

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


ready(() => {
    ko.applyBindings(new viewModel());
});

