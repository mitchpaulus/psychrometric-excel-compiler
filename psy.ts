/// <reference path="knockout.d.ts" />
const xwxda: string = "0.621945";
const p_sea_level: string = "14.696"

const c1: string = "-1.0214165e4";
const c2: string = "-4.8932428";
const c3: string = "-5.376579e-3";
const c4: string = "1.9202377e-7";
const c5: string = "3.5575832e-10";
const c6: string = "-9.0344688e-14";
const c7: string = "4.1635019";

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

        var low_exp = `${c1}/${tR} + ${c2} + ${c3}*${tR} + ${c4}*${tR}*${tR} + ${c5}*${tR}*${tR}*${tR} + ${c6}*${tR}*${tR}*${tR}*${tR} + ${c7}*LN(${tR})`
        var high_exp = `${c8}/${tR} + ${c9} + ${c10}*${tR} + ${c11}*${tR}*${tR} + ${c12}*${tR}*${tR}*${tR} + ${c13}*LN(${tR})`;

        return `IF(${tR} > 491.67, EXP(${high_exp}), EXP(${low_exp}))`;
    }

    h_t_w(t: string, w: string) {
       return  `0.24*(${t}) + (${w})*(1061 + 0.444*(${t}))`;
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

    w_t_twb_wstar(t: string, twb: string, wstar: string, pt: string) {

        var above32 = `((1093 - 0.556*(${twb}))*(${wstar}) - 0.24*((${t}) - (${twb}))) / (1093 + 0.444*(${t}) - (${twb}))`;
        var below32 = `((1220 - 0.04*(${twb}))*(${wstar}) - 0.24*((${t}) - (${twb}))) / (1220 + 0.444*(${t}) - 0.48*(${twb}))`;


        return `IF((${twb}) > 32,${above32},${below32})`;
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
        var sat_w_twb = `${this.w_pv_pt(this.satPress(twb), p_sea_level)}`;

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

class T_rh_model {
    psy = new PsychrometricFormulas();

    drybulb = ko.observable("A1");
    rh = ko.observable("B1");

    pws = new ComputedProperty(() => this.psy.satPress(this.drybulb()), "C1");
    pw  = new ComputedProperty(() => `(${this.rh()}*${this.pws.value()})`, "D1");
    w   = new ComputedProperty(() => this.psy.w_pv_pt(this.pw.value(), p_sea_level)  , "E1");
    h   = ko.pureComputed(()      => `${this.psy.h_t_w(this.drybulb(), `(${this.w.value()})`)}`);
    tdp = ko.pureComputed(()      => this.psy.tdp_pv(`(${this.pw.value()})`));
    v   = ko.pureComputed(()      => this.psy.v_t_w(this.drybulb(), this.w.value(), p_sea_level));
}

class T_tdp_model {
    psy = new PsychrometricFormulas();

    drybulb = ko.observable("A1");
    tdp = ko.observable("B1");

    pw  = new ComputedProperty(() => this.psy.satPress(this.tdp()), "D1");
    pws = new ComputedProperty(() => this.psy.satPress(this.drybulb()), "C1");
    w   = new ComputedProperty(() => this.psy.w_pv_pt(this.pw.value(), p_sea_level)  , "E1");
    rh = ko.pureComputed(() => `(${this.pw.value()})/(${this.pws.value()})`);
    h  = ko.pureComputed(() => `${this.psy.h_t_w(this.drybulb(), `(${this.w.value()})`)}`);
    v  = ko.pureComputed(() => this.psy.v_t_w(this.drybulb(), this.w.value(), p_sea_level));
}

class T_twb_model {
    psy = new PsychrometricFormulas();

    drybulb = ko.observable("A1");
    twb     = ko.observable("B1");

    w_sat_twb = new ComputedProperty(() => this.psy.w_pv_pt(this.psy.satPress(this.twb()), p_sea_level), "C1");
    w   = new ComputedProperty(() => this.psy.w_t_twb_wstar(this.drybulb(), this.twb(), this.w_sat_twb.value(), p_sea_level), "D1");
    pws = new ComputedProperty(() => this.psy.satPress(this.drybulb()), "E1");
    pw  = new ComputedProperty(() => `(${p_sea_level}*(${this.w.value()})) / (${xwxda} + (${this.w.value()}))`, "F1");
    rh = ko.pureComputed(() => `(${this.pw.value()})/(${this.pws.value()})`);
    h  = ko.pureComputed(() => `${this.psy.h_t_w(this.drybulb(), `(${this.w.value()})`)}`);
    v  = ko.pureComputed(() => this.psy.v_t_w(this.drybulb(), this.w.value(), p_sea_level));
    tdp = ko.pureComputed(()      => this.psy.tdp_pv(`(${this.pw.value()})`));
}


class viewModel {
    t_rh  = new T_rh_model();
    t_tdp = new T_tdp_model();
    t_twb = new T_twb_model();
}

function ready(fn: any) {
  if ((document as any).attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(() => { ko.applyBindings(new viewModel()); });

