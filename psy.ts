/// <reference path="knockout.d.ts" />
const xwxda: string = "0.621945";

const c8: number = -1.0440397e4;
const c9: number = -1.129465e1;
const c10: number = -2.7022355e-2;
const c11: number = 1.289036e-5;
const c12: number = -2.4780681e-9;
const c13: number = 6.5459673;

class PsychrometricFormulas {
    humidRatioPvPt(pv: string, pt: string) {
        return `${xwxda}*(${pv})/((${pt})-(${pv}))`;
    }

    // t: cell reference to temperature in °F
    satPress(t: string) {

        var tR = `((${t}) + 459.67)`;
        var exp = `${c8}/${tR} + ${c9} + ${c10}*${tR} + ${c11}*${tR}*${tR} + ${c12}*${tR}*${tR}*${tR} + ${c13}*LN(${tR})`;

        return `EXP(${exp})`;
    }

    h_t_w(t: string, w: string) {
        return `0.24*(${t}) + (${w})*(1061 + 0.444*(${t}))`
    }

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
}

class viewModel {

    psy = new PsychrometricFormulas();

    drybulb = ko.observable("A1");
    rh = ko.observable("B1");

    pws = ko.pureComputed(() => {
        return this.psy.satPress(this.drybulb())
    });

    pw = ko.pureComputed(() => {
        return `(${this.rh()}*${this.pws()})`
    });

    w = ko.pureComputed(() => {
        return  this.psy.humidRatioPvPt(this.pw(), "14.696");
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

