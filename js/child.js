/**
 * Child BMI calculator (BMI-for-age percentile), exposed as window.GBMIChild.
 *
 * GBMIChild.init( $wrapper, t ) wires up one instance: it reads that wrapper's
 * scoped .gbmi-child-* fields, runs the percentile engine and writes the
 * localized result into .gbmi-child-result. Multiple instances on a page are
 * independent (no global ids, no document.formc).
 *
 * The BMI-for-age percentile curves below are derived from the CDC 2000 growth
 * charts (ages 2-20); the numeric coefficients are kept verbatim from the
 * verified original implementation.
 */
window.GBMIChild = ( function () {
    'use strict';

    // Shared child strings (validation messages, result template, category
    // names). Identical for every instance; set by init().
    var childTranslate = {};

    // Map a BMI-for-age percentile (a number, or the '< 5th' / '> 95th'
    // sentinel strings returned by calc()) to a CDC weight-status category.
    // Highest band is tested first so every band is reachable.
    function childCategory(percentile) {
        if (percentile === '> 95th') { return childTranslate.moderately_obese; }
        if (percentile === '< 5th') { return childTranslate.underweight; }
        var pct = parseFloat(percentile);
        if (isNaN(pct)) { return childTranslate.underweight; }
        if (pct >= 95) { return childTranslate.moderately_obese; }
        if (pct >= 85) { return childTranslate.overweight; }
        if (pct >= 5) { return childTranslate.norm; }
        return childTranslate.underweight;
    }

    // Minimal sprintf for "%1$s" style placeholders in the localized template.
    function childFormat(tmpl, args) {
        return String(tmpl).replace(/%(\d+)\$s/g, function (match, n) {
            return args[n - 1];
        });
    }

    // Wire up one calculator instance, scoped to its wrapper element.
    function init( $root, t ) {
        var $ = window.jQuery;
        childTranslate = t;

        function compute() {
            var data = {
                p1B2: $root.find( '.gbmi-child-gender' ).val(),
                p1B3: parseFloat( $root.find( '.gbmi-child-age' ).val() ),
                p1B4: parseFloat( $root.find( '.gbmi-child-height' ).val() ),
                p1C4: $root.find( '.gbmi-child-height-unit' ).val(),
                p1B5: parseFloat( $root.find( '.gbmi-child-weight' ).val() ),
                p1C5: $root.find( '.gbmi-child-weight-unit' ).val()
            };
            calc( data );

            var $result = $root.find( '.gbmi-child-result' );
            $root.find( '.gbmi-result' ).hide().fadeOut();

            // If the BMI itself is a validation message, show just that.
            if ( ! eeisnumber( data.p1B7 ) ) {
                $result.hide().text( data.p1B7 ).fadeIn();
                return;
            }
            var bmi = eedisplayFloatND( data.p1B7, 1 );
            var percentile = eeisnumber( data.p1B8 ) ? eedisplayFloatND( data.p1B8, 0 ) : data.p1B8;
            $result.hide().text( childFormat( childTranslate.result, [ bmi, percentile, childCategory( percentile ) ] ) ).fadeIn();
        }

        $root.find( '.gbmi-child-submit' ).on( 'click', compute );
        $root.find( '.gbmi-child-gender' ).on( 'change', compute );
    }
    
    
    // === BMI-for-age percentile engine (CDC 2000, ages 2-20) ===

    var eedec = ".";
    var eeth = ",";
    var eedecreg = new RegExp("[.]", "g");
    var eethreg = new RegExp(",", "g");


    var row1xA13A31 = new Array(19);

    for (var jj = 0; jj < 19; jj++) {
        row1xA13A31[jj] = 0
    }
    

    var row1xB13B31 = new Array(19);
    for (var jj = 0; jj < 19; jj++) {
        row1xB13B31[jj] = ""
    }
    
    var row1xC13C31 = new Array(19);
    for (var jj = 0; jj < 19; jj++) {
        row1xC13C31[jj] = ""
    }
    
    var row1xD13D31 = new Array(19);
    for (var jj = 0; jj < 19; jj++) {
        row1xD13D31[jj] = 0
    }
    
    var eecm1 = new Array();

    function calc(data) {
        var c1B2 = data.p1B2;
        var c1B3 = data.p1B3;
        var c1B4 = data.p1B4;
        var c1C4 = data.p1C4;
        var c1B5 = data.p1B5;
        var c1C5 = data.p1C5;
        row1xA13A31[0] = (1);
        row1xD13D31[0] = (16.6);
        row1xA13A31[1] = (2);
        row1xD13D31[1] = (16);
        row1xA13A31[2] = (3);
        row1xD13D31[2] = (15.6);
        row1xA13A31[3] = (4);
        row1xD13D31[3] = (15.4);
        row1xA13A31[4] = (5);
        row1xD13D31[4] = (15.3);
        row1xA13A31[5] = (6);
        row1xD13D31[5] = (15.3);
        row1xA13A31[6] = (7);
        row1xD13D31[6] = (15.5);
        row1xA13A31[7] = (8);
        row1xD13D31[7] = (16);
        row1xA13A31[8] = (9);
        row1xD13D31[8] = (16.6);
        row1xA13A31[9] = (10);
        row1xD13D31[9] = (17.1);
        row1xA13A31[10] = (11);
        row1xD13D31[10] = (17.8);
        row1xA13A31[11] = (12);
        row1xD13D31[11] = (18.3);
        row1xA13A31[12] = (13);
        row1xD13D31[12] = (18.9);
        row1xA13A31[13] = (14);
        row1xD13D31[13] = (19.4);
        row1xA13A31[14] = (15);
        row1xD13D31[14] = (19.9);
        row1xA13A31[15] = (16);
        row1xD13D31[15] = (20.2);
        row1xA13A31[16] = (17);
        row1xD13D31[16] = (20.7);
        row1xA13A31[17] = (18);
        row1xD13D31[17] = (21.1);
        row1xA13A31[18] = (19);
        row1xD13D31[18] = (21.4);
        var c1D4 = (((str_eq((c1C4), ("centimeters"))) ? (c1B4) : (((c1B4) * (2.54)))));
        var c1D5 = (((str_eq((c1C5), ("kilograms"))) ? (c1B5) : (((c1B5) * (0.4536)))));
        var tmp7 = (((c1D5) <= (0)));
        var tmp8 = (((c1D5) > (110)));
        var sumcnt9_sum = ((false || tmp8) || tmp7);
        var sumcnt9_cnt = 2;
        var tmp10 = (((c1D4) < (30)));
        var tmp11 = (((c1D4) > (240)));
        var sumcnt12_sum = ((false || tmp11) || tmp10);
        var sumcnt12_cnt = 2;
        var tmp13 = ((((((orgeneral(0, sumcnt12_sum, sumcnt12_cnt, eecm1)) ? 1 : 0)) * (((orgeneral(0, sumcnt9_sum, sumcnt9_cnt, eecm1)) ? 1 : 0))) != 0.));
        var sumcnt14_sum = (true && tmp13);
        var sumcnt14_cnt = 1;
        var tmp15 = (((c1D4) < (30)));
        var tmp16 = (((c1D4) > (240)));
        var sumcnt17_sum = ((false || tmp16) || tmp15);
        var sumcnt17_cnt = 2;
        var tmp18 = (((c1D5) <= (0)));
        var tmp19 = (((c1D5) > (110)));
        var sumcnt20_sum = ((false || tmp19) || tmp18);
        var sumcnt20_cnt = 2;
        var c1B7 = (((andgeneral(0, sumcnt14_sum, sumcnt14_cnt, eecm1)) ? (childTranslate.valid1) : (((orgeneral(0, sumcnt17_sum, sumcnt17_cnt, eecm1)) ? (childTranslate.valid2) : (((orgeneral(0, sumcnt20_sum, sumcnt20_cnt, eecm1)) ? (childTranslate.valid3) : (((c1D5) / (Math.pow((((c1D4) / (100))), (2)))))))))));
        var tmp1 = (((c1B3) < (0.5)));
        var tmp2 = (((c1B3) > (20)));
        var sumcnt3_sum = ((false || tmp2) || tmp1);
        var sumcnt3_cnt = 2;
        var c1B9 = (((orgeneral(0, sumcnt3_sum, sumcnt3_cnt, eecm1)) ? (childTranslate.valid4) : (((!(eeisnumber((c1B7)))) ? (c1B7) : (((str_eq((c1B2), ("Female"))) ? (((v2n(c1B7)) / (lookup3vv((round((c1B3), (0))), row1xA13A31, 0, 18, row1xD13D31, 0, 18)))) : (((str_eq((c1B2), ("Male"))) ? (((v2n(c1B7)) / (lookup3vv((round((c1B3), (0))), row1xA13A31, 0, 18, row1xD13D31, 0, 18)))) : ("")))))))));
        row1xB13B31[0] = (((var_ls((c1B7), (14.7))) ? ("< 5th") : (((var_gr((c1B7), (19.3))) ? ("> 95th") : (((var_ls((c1B7), (16.6))) ? (((((((6.5745111) * (Math.pow((v2n(c1B7)), (2))))) - (((182.3837) * (v2n(c1B7)))))) + (1265.7856))) : (((((((-4.852769) * (Math.pow((v2n(c1B7)), (2))))) + (((190.85499) * (v2n(c1B7)))))) - (1780.938)))))))));
        row1xC13C31[0] = (((var_ls((c1B7), (14.6))) ? ("< 5th") : (((var_gr((c1B7), (19.9))) ? ("> 95th") : (((var_ls((c1B7), (17.2))) ? (((((((4.5974644) * (Math.pow((v2n(c1B7)), (2))))) - (((128.5099) * (v2n(c1B7)))))) + (900.63047))) : (((((((-2.01467) * (Math.pow((v2n(c1B7)), (2))))) + (((91.603202) * (v2n(c1B7)))))) - (929.6572)))))))));
        row1xB13B31[1] = (((var_ls((c1B7), (14.3))) ? ("< 5th") : (((var_gr((c1B7), (18.7))) ? ("> 95th") : (((var_ls((c1B7), (16))) ? (((((((9.6601537) * (Math.pow((v2n(c1B7)), (2))))) - (((266.0637) * (v2n(c1B7)))))) + (1834.1067))) : (((((((-4.102342) * (Math.pow((v2n(c1B7)), (2))))) + (((159.18945) * (v2n(c1B7)))))) - (1446.988)))))))));
        row1xC13C31[1] = (((var_ls((c1B7), (14.4))) ? ("< 5th") : (((var_gr((c1B7), (19))) ? ("> 95th") : (((var_ls((c1B7), (16.5))) ? (((((((8.0084129) * (Math.pow((v2n(c1B7)), (2))))) - (((225.8683) * (v2n(c1B7)))))) + (1596.6707))) : (((((((-3.840346) * (Math.pow((v2n(c1B7)), (2))))) + (((154.60113) * (v2n(c1B7)))))) - (1455.577)))))))));
        row1xB13B31[2] = (((var_ls((c1B7), (13.9))) ? ("< 5th") : (((var_gr((c1B7), (18.3))) ? ("> 95th") : (((var_ls((c1B7), (15.6))) ? (((((((10.929732) * (Math.pow((v2n(c1B7)), (2))))) - (((295.4886) * (v2n(c1B7)))))) + (2000.0595))) : (((((((-4.102342) * (Math.pow((v2n(c1B7)), (2))))) + (((155.90758) * (v2n(c1B7)))))) - (1383.969)))))))));
        row1xC13C31[2] = (((var_ls((c1B7), (14))) ? ("< 5th") : (((var_gr((c1B7), (18.4))) ? ("> 95th") : (((var_ls((c1B7), (16))) ? (((((((10.144836) * (Math.pow((v2n(c1B7)), (2))))) - (((281.8513) * (v2n(c1B7)))))) + (1962.5378))) : (((((((-4.862358) * (Math.pow((v2n(c1B7)), (2))))) + (((186.22083) * (v2n(c1B7)))))) - (1684.927)))))))));
        row1xB13B31[3] = (((var_ls((c1B7), (13.6))) ? ("< 5th") : (((var_gr((c1B7), (18.2))) ? ("> 95th") : (((var_ls((c1B7), (15.4))) ? (((((((10.400031) * (Math.pow((v2n(c1B7)), (2))))) - (((276.3876) * (v2n(c1B7)))))) + (1840.0429))) : (((((((-4.02173) * (Math.pow((v2n(c1B7)), (2))))) + (((151.26489) * (v2n(c1B7)))))) - (1325.746)))))))));
        row1xC13C31[3] = (((var_ls((c1B7), (13.8))) ? ("< 5th") : (((var_gr((c1B7), (18.1))) ? ("> 95th") : (((var_ls((c1B7), (15.8))) ? (((((((8.4018375) * (Math.pow((v2n(c1B7)), (2))))) - (((225.8422) * (v2n(c1B7)))))) + (1521.1476))) : (((((((-7.345051) * (Math.pow((v2n(c1B7)), (2))))) + (((268.36966) * (v2n(c1B7)))))) - (2356.446)))))))));
        row1xB13B31[4] = (((var_ls((c1B7), (13.5))) ? ("< 5th") : (((var_gr((c1B7), (18.3))) ? ("> 95th") : (((var_ls((c1B7), (15.3))) ? (((((((10.400031) * (Math.pow((v2n(c1B7)), (2))))) - (((274.3076) * (v2n(c1B7)))))) + (1812.5082))) : (((((((-4.588485) * (Math.pow((v2n(c1B7)), (2))))) + (((168.95286) * (v2n(c1B7)))))) - (1460.582)))))))));
        row1xC13C31[4] = (((var_ls((c1B7), (13.7))) ? ("< 5th") : (((var_gr((c1B7), (18))) ? ("> 95th") : (((var_ls((c1B7), (15.5))) ? (((((((12.899116) * (Math.pow((v2n(c1B7)), (2))))) - (((351.9558) * (v2n(c1B7)))))) + (2406.0664))) : (((((((-7.016402) * (Math.pow((v2n(c1B7)), (2))))) + (((252.73142) * (v2n(c1B7)))))) - (2181.287)))))))));
        row1xB13B31[5] = (((var_ls((c1B7), (13.3))) ? ("< 5th") : (((var_gr((c1B7), (18.8))) ? ("> 95th") : (((var_ls((c1B7), (15.3))) ? (((((((10.144836) * (Math.pow((v2n(c1B7)), (2))))) - (((267.6486) * (v2n(c1B7)))))) + (1770.2128))) : (((((((-3.787879) * (Math.pow((v2n(c1B7)), (2))))) + (((141.86394) * (v2n(c1B7)))))) - (1233.534)))))))));
        row1xC13C31[5] = (((var_ls((c1B7), (13.6))) ? ("< 5th") : (((var_gr((c1B7), (18.1))) ? ("> 95th") : (((var_ls((c1B7), (15.4))) ? (((((((9.5231433) * (Math.pow((v2n(c1B7)), (2))))) - (((251.2705) * (v2n(c1B7)))))) + (1661.0014))) : (((((((-5.6235) * (Math.pow((v2n(c1B7)), (2))))) + (((204.77956) * (v2n(c1B7)))))) - (1769.631)))))))));
        row1xB13B31[6] = (((var_ls((c1B7), (13.4))) ? ("< 5th") : (((var_gr((c1B7), (19.7))) ? ("> 95th") : (((var_ls((c1B7), (15.5))) ? (((((((8.0084129) * (Math.pow((v2n(c1B7)), (2))))) - (((209.8514) * (v2n(c1B7)))))) + (1378.8109))) : (((var_ls((c1B7), (16.7))) ? (((((((-4.166667) * (Math.pow((v2n(c1B7)), (2))))) + (((155) * (v2n(c1B7)))))) - (1351.458))) : (((((((-1.388889) * (Math.pow((v2n(c1B7)), (2))))) + (((57.222222) * (v2n(c1B7)))))) - (493.2639)))))))))));
        row1xC13C31[6] = (((var_ls((c1B7), (13.6))) ? ("< 5th") : (((var_gr((c1B7), (18.9))) ? ("> 95th") : (((var_ls((c1B7), (15.5))) ? (((((((7.0078568) * (Math.pow((v2n(c1B7)), (2))))) - (((180.1728) * (v2n(c1B7)))))) + (1159.0779))) : (((var_ls((c1B7), (16.5))) ? (((((((-5.681818) * (Math.pow((v2n(c1B7)), (2))))) + (((206.81818) * (v2n(c1B7)))))) - (1790.625))) : (((((((-3.472222) * (Math.pow((v2n(c1B7)), (2))))) + (((131.25) * (v2n(c1B7)))))) - (1145.313)))))))))));
        row1xB13B31[7] = (((var_ls((c1B7), (13.6))) ? ("< 5th") : (((var_gr((c1B7), (21))) ? ("> 95th") : (((var_ls((c1B7), (16))) ? (((((((4.8623579) * (Math.pow((v2n(c1B7)), (2))))) - (((124.9701) * (v2n(c1B7)))))) + (804.91472))) : (((var_ls((c1B7), (17.2))) ? (((((((-4.122103) * (Math.pow((v2n(c1B7)), (2))))) + (((157.68717) * (v2n(c1B7)))))) - (1417.736))) : (((((((-0.97189) * (Math.pow((v2n(c1B7)), (2))))) + (((42.389354) * (v2n(c1B7)))))) - (366.573)))))))))));
        row1xC13C31[7] = (((var_ls((c1B7), (13.7))) ? ("< 5th") : (((var_gr((c1B7), (19.7))) ? ("> 95th") : (((var_ls((c1B7), (15.7))) ? (((((((7.0665829) * (Math.pow((v2n(c1B7)), (2))))) - (((185.3957) * (v2n(c1B7)))))) + (1218.7955))) : (((((((-2.849003) * (Math.pow((v2n(c1B7)), (2))))) + (((112.04624) * (v2n(c1B7)))))) - (1006.758)))))))));
        row1xB13B31[8] = (((var_ls((c1B7), (14))) ? ("< 5th") : (((var_gr((c1B7), (22.7))) ? ("> 95th") : (((var_ls((c1B7), (16.6))) ? (((((((3.5880286) * (Math.pow((v2n(c1B7)), (2))))) - (((92.50822) * (v2n(c1B7)))))) + (596.90511))) : (((var_ls((c1B7), (18))) ? (((((((-2.97619) * (Math.pow((v2n(c1B7)), (2))))) + (((120.83333) * (v2n(c1B7)))))) - (1135.714))) : (((((((-0.579907) * (Math.pow((v2n(c1B7)), (2))))) + (((27.857543) * (v2n(c1B7)))))) - (238.5458)))))))))));
        row1xC13C31[8] = (((var_ls((c1B7), (14))) ? ("< 5th") : (((var_gr((c1B7), (20.9))) ? ("> 95th") : (((var_ls((c1B7), (16))) ? (((((((4.666799) * (Math.pow((v2n(c1B7)), (2))))) - (((117.6612) * (v2n(c1B7)))))) + (737.82339))) : (((((((-1.893939) * (Math.pow((v2n(c1B7)), (2))))) + (((79.031345) * (v2n(c1B7)))))) - (729.5582)))))))));
        row1xB13B31[9] = (((var_ls((c1B7), (14.3))) ? ("< 5th") : (((var_gr((c1B7), (24.2))) ? ("> 95th") : (((var_ls((c1B7), (17.1))) ? (((((((3.3517478) * (Math.pow((v2n(c1B7)), (2))))) - (((88.94666) * (v2n(c1B7)))))) + (591.09876))) : (((var_ls((c1B7), (19))) ? (((((((-1.659734) * (Math.pow((v2n(c1B7)), (2))))) + (((73.074308) * (v2n(c1B7)))))) - (714.2477))) : (((((((-0.629579) * (Math.pow((v2n(c1B7)), (2))))) + (((31.043956) * (v2n(c1B7)))))) - (287.5572)))))))))));
        row1xC13C31[9] = (((var_ls((c1B7), (14.2))) ? ("< 5th") : (((var_gr((c1B7), (22.2))) ? ("> 95th") : (((var_ls((c1B7), (16.6))) ? (((((((3.0675692) * (Math.pow((v2n(c1B7)), (2))))) - (((75.72176) * (v2n(c1B7)))))) + (461.6862))) : (((((((-1.498702) * (Math.pow((v2n(c1B7)), (2))))) + (((66.155292) * (v2n(c1B7)))))) - (635.1081)))))))));
        row1xB13B31[10] = (((var_ls((c1B7), (14.6))) ? ("< 5th") : (((var_gr((c1B7), (25.7))) ? ("> 95th") : (((var_ls((c1B7), (17.8))) ? (((((((1.3605238) * (Math.pow((v2n(c1B7)), (2))))) - (((29.68961) * (v2n(c1B7)))))) + (147.63683))) : (((var_ls((c1B7), (19.8))) ? (((((((-1.502404) * (Math.pow((v2n(c1B7)), (2))))) + (((68.990385) * (v2n(c1B7)))))) - (702.0072))) : (((((((-0.480618) * (Math.pow((v2n(c1B7)), (2))))) + (((25.257965) * (v2n(c1B7)))))) - (236.6861)))))))))));
        row1xC13C31[10] = (((var_ls((c1B7), (14.6))) ? ("< 5th") : (((var_gr((c1B7), (23.5))) ? ("> 95th") : (((var_ls((c1B7), (17.2))) ? (((((((2.4852546) * (Math.pow((v2n(c1B7)), (2))))) - (((61.77326) * (v2n(c1B7)))))) + (377.23969))) : (((var_ls((c1B7), (19.2))) ? (((((((-1.30662) * (Math.pow((v2n(c1B7)), (2))))) + (((60.060976) * (v2n(c1B7)))))) - (596.4983))) : (((((((-1.132588) * (Math.pow((v2n(c1B7)), (2))))) + (((53.012685) * (v2n(c1B7)))))) - (525.3262)))))))))));
        row1xB13B31[11] = (((var_ls((c1B7), (15))) ? ("< 5th") : (((var_gr((c1B7), (26.8))) ? ("> 95th") : (((var_ls((c1B7), (18.3))) ? (((((((1.2853726) * (Math.pow((v2n(c1B7)), (2))))) - (((29.01195) * (v2n(c1B7)))))) + (150.55772))) : (((var_ls((c1B7), (20.4))) ? (((((((-1.362835) * (Math.pow((v2n(c1B7)), (2))))) + (((64.646465) * (v2n(c1B7)))))) - (676.6306))) : (((((((-0.458211) * (Math.pow((v2n(c1B7)), (2))))) + (((24.752566) * (v2n(c1B7)))))) - (239.2632)))))))))));
        row1xC13C31[11] = (((var_ls((c1B7), (15.1))) ? ("< 5th") : (((var_gr((c1B7), (24.8))) ? ("> 95th") : (((var_ls((c1B7), (17.8))) ? (((((((1.8298339) * (Math.pow((v2n(c1B7)), (2))))) - (((43.53786) * (v2n(c1B7)))))) + (245.20803))) : (((var_ls((c1B7), (20))) ? (((((((-1.075977) * (Math.pow((v2n(c1B7)), (2))))) + (((52.035573) * (v2n(c1B7)))))) - (535.3206))) : (((((((-0.942029) * (Math.pow((v2n(c1B7)), (2))))) + (((46.369565) * (v2n(c1B7)))))) - (475.5797)))))))))));
        row1xB13B31[12] = (((var_ls((c1B7), (15.4))) ? ("< 5th") : (((var_gr((c1B7), (27.9))) ? ("> 95th") : (((var_ls((c1B7), (18.9))) ? (((((((0.721787) * (Math.pow((v2n(c1B7)), (2))))) - (((11.71291) * (v2n(c1B7)))))) + (13.651678))) : (((var_ls((c1B7), (21.2))) ? (((((((-1.135147) * (Math.pow((v2n(c1B7)), (2))))) + (((56.388948) * (v2n(c1B7)))))) - (610.2654))) : (((((((-0.40645) * (Math.pow((v2n(c1B7)), (2))))) + (((22.941764) * (v2n(c1B7)))))) - (228.6906)))))))))));
        row1xC13C31[12] = (((var_ls((c1B7), (15.6))) ? ("< 5th") : (((var_gr((c1B7), (25.8))) ? ("> 95th") : (((var_ls((c1B7), (18.4))) ? (((((((2.0573725) * (Math.pow((v2n(c1B7)), (2))))) - (((53.97538) * (v2n(c1B7)))))) + (346.55949))) : (((((((-0.849432) * (Math.pow((v2n(c1B7)), (2))))) + (((43.608961) * (v2n(c1B7)))))) - (464.7563)))))))));
        row1xB13B31[13] = (((var_ls((c1B7), (15.7))) ? ("< 5th") : (((var_gr((c1B7), (28.6))) ? ("> 95th") : (((var_ls((c1B7), (19.4))) ? (((((((0.7268851) * (Math.pow((v2n(c1B7)), (2))))) - (((13.11623) * (v2n(c1B7)))))) + (31.041935))) : (((var_ls((c1B7), (21.8))) ? (((((((-1.039144) * (Math.pow((v2n(c1B7)), (2))))) + (((53.229419) * (v2n(c1B7)))))) - (591.5583))) : (((((((-0.407436) * (Math.pow((v2n(c1B7)), (2))))) + (((23.475936) * (v2n(c1B7)))))) - (243.1457)))))))))));
        row1xC13C31[13] = (((var_ls((c1B7), (16.1))) ? ("< 5th") : (((var_gr((c1B7), (26.8))) ? ("> 95th") : (((var_ls((c1B7), (19.1))) ? (((((((1.8117346) * (Math.pow((v2n(c1B7)), (2))))) - (((48.73513) * (v2n(c1B7)))))) + (319.92319))) : (((((((-0.786164) * (Math.pow((v2n(c1B7)), (2))))) + (((41.845615) * (v2n(c1B7)))))) - (462.1297)))))))));
        row1xB13B31[14] = (((var_ls((c1B7), (16.1))) ? ("< 5th") : (((var_gr((c1B7), (29.4))) ? ("> 95th") : (((var_ls((c1B7), (19.9))) ? (((((((0.8137127) * (Math.pow((v2n(c1B7)), (2))))) - (((17.27052) * (v2n(c1B7)))))) + (71.571639))) : (((var_ls((c1B7), (22.4))) ? (((((((-0.956284) * (Math.pow((v2n(c1B7)), (2))))) + (((50.45082) * (v2n(c1B7)))))) - (575.2732))) : (((((((-0.385154) * (Math.pow((v2n(c1B7)), (2))))) + (((22.808123) * (v2n(c1B7)))))) - (242.6471)))))))))));
        row1xC13C31[14] = (((var_ls((c1B7), (16.6))) ? ("< 5th") : (((var_gr((c1B7), (27.7))) ? ("> 95th") : (((var_ls((c1B7), (19.7))) ? (((((((2.5054069) * (Math.pow((v2n(c1B7)), (2))))) - (((76.59692) * (v2n(c1B7)))))) + (586.52726))) : (((var_ls((c1B7), (22.2))) ? (((((((-0.932018) * (Math.pow((v2n(c1B7)), (2))))) + (((49.051535) * (v2n(c1B7)))))) - (554.6086))) : (((((((-0.457016) * (Math.pow((v2n(c1B7)), (2))))) + (((26.441453) * (v2n(c1B7)))))) - (286.7646)))))))))));
        row1xB13B31[15] = (((var_ls((c1B7), (16.4))) ? ("< 5th") : (((var_gr((c1B7), (30))) ? ("> 95th") : (((var_ls((c1B7), (20.2))) ? (((((((1.0986916) * (Math.pow((v2n(c1B7)), (2))))) - (((28.25778) * (v2n(c1B7)))))) + (172.58255))) : (((var_ls((c1B7), (22.8))) ? (((((((-0.882751) * (Math.pow((v2n(c1B7)), (2))))) + (((47.573673) * (v2n(c1B7)))))) - (550.7905))) : (((((((-0.36465) * (Math.pow((v2n(c1B7)), (2))))) + (((22.031317) * (v2n(c1B7)))))) - (237.7542)))))))))));
        row1xC13C31[15] = (((var_ls((c1B7), (17.2))) ? ("< 5th") : (((var_gr((c1B7), (28.4))) ? ("> 95th") : (((var_ls((c1B7), (20.5))) ? (((((((2.178566) * (Math.pow((v2n(c1B7)), (2))))) - (((68.54933) * (v2n(c1B7)))))) + (539.67771))) : (((var_ls((c1B7), (22.9))) ? (((((((-1.023065) * (Math.pow((v2n(c1B7)), (2))))) + (((54.817708) * (v2n(c1B7)))))) - (643.8198))) : (((((((-0.457016) * (Math.pow((v2n(c1B7)), (2))))) + (((27.081275) * (v2n(c1B7)))))) - (305.4975)))))))))));
        row1xB13B31[16] = (((var_ls((c1B7), (16.9))) ? ("< 5th") : (((var_gr((c1B7), (30.5))) ? ("> 95th") : (((var_ls((c1B7), (20.7))) ? (((((((1.0986916) * (Math.pow((v2n(c1B7)), (2))))) - (((29.35647) * (v2n(c1B7)))))) + (186.98611))) : (((var_ls((c1B7), (23.3))) ? (((((((-0.885628) * (Math.pow((v2n(c1B7)), (2))))) + (((48.582996) * (v2n(c1B7)))))) - (576.1855))) : (((((((-0.343997) * (Math.pow((v2n(c1B7)), (2))))) + (((21.28483) * (v2n(c1B7)))))) - (234.1839)))))))))));
        row1xC13C31[16] = (((var_ls((c1B7), (17.7))) ? ("< 5th") : (((var_gr((c1B7), (29))) ? ("> 95th") : (((var_ls((c1B7), (21.2))) ? (((((((1.932012) * (Math.pow((v2n(c1B7)), (2))))) - (((62.26754) * (v2n(c1B7)))))) + (501.77516))) : (((var_ls((c1B7), (23.4))) ? (((((((-1.240857) * (Math.pow((v2n(c1B7)), (2))))) + (((66.705852) * (v2n(c1B7)))))) - (806.4734))) : (((((((-0.297619) * (Math.pow((v2n(c1B7)), (2))))) + (((19.166667) * (v2n(c1B7)))))) - (210.5357)))))))))));
        row1xB13B31[17] = (((var_ls((c1B7), (17.2))) ? ("< 5th") : (((var_gr((c1B7), (31))) ? ("> 95th") : (((var_ls((c1B7), (21.1))) ? (((((((1.4948127) * (Math.pow((v2n(c1B7)), (2))))) - (((45.64661) * (v2n(c1B7)))))) + (347.70261))) : (((var_ls((c1B7), (23.7))) ? (((((((-0.882751) * (Math.pow((v2n(c1B7)), (2))))) + (((49.162624) * (v2n(c1B7)))))) - (594.3218))) : (((((((-0.365091) * (Math.pow((v2n(c1B7)), (2))))) + (((22.71021) * (v2n(c1B7)))))) - (258.164)))))))))));
        row1xC13C31[17] = (((var_ls((c1B7), (18.3))) ? ("< 5th") : (((var_gr((c1B7), (29.7))) ? ("> 95th") : (((var_ls((c1B7), (21.9))) ? (((((((1.7205506) * (Math.pow((v2n(c1B7)), (2))))) - (((56.51408) * (v2n(c1B7)))))) + (462.60923))) : (((var_ls((c1B7), (24))) ? (((((((-1.35357) * (Math.pow((v2n(c1B7)), (2))))) + (((74.03364) * (v2n(c1B7)))))) - (922.1508))) : (((((((-0.272641) * (Math.pow((v2n(c1B7)), (2))))) + (((18.149597) * (v2n(c1B7)))))) - (203.5491)))))))))));
        row1xB13B31[18] = (((var_ls((c1B7), (17.5))) ? ("< 5th") : (((var_gr((c1B7), (31.3))) ? ("> 95th") : (((var_ls((c1B7), (21.4))) ? (((((((1.835396) * (Math.pow((v2n(c1B7)), (2))))) - (((59.80232) * (v2n(c1B7)))))) + (489.29761))) : (((var_ls((c1B7), (24))) ? (((((((-0.882751) * (Math.pow((v2n(c1B7)), (2))))) + (((49.692275) * (v2n(c1B7)))))) - (609.1501))) : (((((((-0.365091) * (Math.pow((v2n(c1B7)), (2))))) + (((22.929265) * (v2n(c1B7)))))) - (265.0099)))))))))));
        row1xC13C31[18] = (((var_ls((c1B7), (19))) ? ("< 5th") : (((var_gr((c1B7), (30.1))) ? ("> 95th") : (((var_ls((c1B7), (22.5))) ? (((((((2.3074556) * (Math.pow((v2n(c1B7)), (2))))) - (((82.98123) * (v2n(c1B7)))))) + (748.85294))) : (((var_ls((c1B7), (24.4))) ? (((((((-1.605473) * (Math.pow((v2n(c1B7)), (2))))) + (((88.454558) * (v2n(c1B7)))))) - (1127.457))) : (((((((-0.187434) * (Math.pow((v2n(c1B7)), (2))))) + (((13.723947) * (v2n(c1B7)))))) - (148.2734)))))))))));
        var tmp4 = (((c1B3) < (0.5)));
        var tmp5 = (((c1B3) > (20)));
        var sumcnt6_sum = ((false || tmp5) || tmp4);
        var sumcnt6_cnt = 2;
        var c1B8 = (((orgeneral(0, sumcnt6_sum, sumcnt6_cnt, eecm1)) ? ("Enter a valid age") : (((!(eeisnumber((c1B7)))) ? (c1B7) : (((str_eq((c1B2), ("Female"))) ? (lookup3vv((round((c1B3), (0))), row1xA13A31, 0, 18, row1xB13B31, 0, 18)) : (((str_eq((c1B2), ("Male"))) ? (lookup3vv((round((c1B3), (0))), row1xA13A31, 0, 18, row1xC13C31, 0, 18)) : ("")))))))));
        data.p1B7 = c1B7;
        data.p1B8 = c1B8;
        data.p1B9 = c1B9;
    }

    function str_eq(x, y) {
        return(x.toLowerCase() == y.toLowerCase())
    }
    
    function str_gr(x, y) {
        return(x.toLowerCase() > y.toLowerCase())
    }

    
    function str_ls(x, y) {
        return(x.toLowerCase() < y.toLowerCase())
    }

    function var_gr(x, y) {
        var xt = mytypeof(x);
        var yt = mytypeof(y);
        if (xt != yt)return(xt > yt);
        switch (xt) {
            case 1:
            case 3:
                return(x > y);
            case 2:
                return str_gr(x, y);
            default:
                return true;
        }
    }

    function var_ls(x, y) {
        var xt = mytypeof(x);
        var yt = mytypeof(y);
        if (xt != yt)return(xt < yt);
        switch (xt) {
            case 1:
            case 3:
                return(x < y);
            case 2:
                return str_ls(x, y);
            default:
                return false;
        }
    }

    
    function mytypeof(v) {
        switch (typeof v) {
            case "number":
                if (myIsNaN(v))return 4;
                return 1;
            case "string":
                return 2;
            case "boolean":
                return 3;
            case "object":
                if (v.constructor == Number) {
                    if (myIsNaN(v))return 4;
                    return 1;
                }
                
                if (v.constructor == String) {
                    return 2;
                }
                
                if (v.constructor == Boolean) {
                    return 3;
                }
                
                return 4;
            default:
                return 4;
        }
    }

    
    function myIsNaN(x) {
        return(isNaN(x) || (typeof x == 'number' && !isFinite(x)));
    }

    function round(n, nd) {
        if (isFinite(n) && isFinite(nd)) {
            var sign_n = (n < 0) ? -1 : 1;
            var abs_n = Math.abs(n);
            var factor = Math.pow(10, nd);
            return sign_n * Math.round(abs_n * factor) / factor;
        } else {
            return NaN;
        }
    }

    function andgeneral(cnt, vsum, vcnt, x) {
        if (!vsum) {
            return false;
        }
        
        for (var ii = 0; ii < x.length; ii++) {
            var arr = x[ii][0];
            for (var jj = x[ii][1]; jj <= x[ii][3]; jj++) {
                for (var kk = x[ii][2]; kk <= x[ii][4]; kk++) {
                    if (!arr[jj][kk]) {
                        return false;
                    }
                    
                }
                
            }
            
        }
        
        return true;
    }

    function orgeneral(cnt, vsum, vcnt, x) {
        if (vsum) {
            return true;
        }
        
        for (var ii = 0; ii < x.length; ii++) {
            var arr = x[ii][0];
            for (var jj = x[ii][1]; jj <= x[ii][3]; jj++) {
                for (var kk = x[ii][2]; kk <= x[ii][4]; kk++) {
                    if (arr[jj][kk]) {
                        return true;
                    }
                    
                }
                
            }
            
        }
        
        return false;
    }

    function s2n(str) {
        str = String(str).replace(eedecreg, ".");
        return parseFloat(str);
    }

    function v2n(v) {
        switch (typeof v) {
            case "number":
                return v;
            case "string":
                return s2n(v);
            case "boolean":
                return v ? 1 : 0;
            case "object":
                if (v.constructor == Number) {
                    return v;
                }
                
                if (v.constructor == String) {
                    return s2n(v);
                }
                
                if (v.constructor == Boolean) {
                    return v ? 1 : 0;
                }
                
                return Number.NaN;
            default:
                return Number.NaN;
        }
    }

    function eeparseFloat(str) {
        str = String(str).replace(eedecreg, ".");
        var res = parseFloat(str);
        if (isNaN(res)) {
            return 0;
        } else {
            return res;
        }
    }

    function eedisplayFloat(x) {
        if (myIsNaN(x)) {
            return Number.NaN;
        } else {
            return String(x).replace(/\./g, eedec);
        }
    }

    function eedisplayFloatND(x, nd) {
        if (myIsNaN(x)) {
            return Number.NaN;
        } else {
            var res = round(x, nd);
            if (nd > 0) {
                var str = String(res);
                if (str.indexOf('e') != -1)return str;
                if (str.indexOf('E') != -1)return str;
                var parts = str.split('.');
                if (parts.length < 2) {
                    var decimals = ('00000000000000').substring(0, nd);
                    return(parts[0]).toString() + eedec + decimals;
                } else {
                    var decimals = ((parts[1]).toString() + '00000000000000').substring(0, nd);
                    return(parts[0]).toString() + eedec + decimals;
                }
            } else {
                return res;
            }
        }
    }

    function eeisstring(v) {
        switch (typeof v) {
            case "string":
                return true;
            case "object":
                return v.constructor == String;
            default:
                return false;
        }
    }

    function eeisnumber(v) {
        if (isNaN(v) || v == Number.NEGATIVE_INFINITY || v == Number.POSITIVE_INFINITY) {
            return false;
        } else {
            switch (typeof v) {
                case "number":
                    return true;
                case "object":
                    return v.constructor == Number;
                default:
                    return false;
            }
        }
    }

    function lookup3vv(key, kvect, kfrom_start, kto_start, vvect, vfrom_, vto_) {
        var current = 0;
        var from_ = kfrom_start;
        var to_ = kto_start + 1;
        while (true) {
            current = (from_ + to_) >> 1;
            if (kvect[current] == key)break;
            if (from_ == to_ - 1)break;
            if (kvect[current] < key) {
                from_ = current;
            } else {
                to_ = current;
            }
        }
        
        while (current < kto_start) {
            if (kvect[current] == kvect[current + 1]) {
                current++;
            } else {
                break;
            }
            
        }
        
        if (key < kvect[current])return Number.NaN;
        return vvect[vfrom_ + current - kfrom_start]
    }

    return { init: init };
} )();