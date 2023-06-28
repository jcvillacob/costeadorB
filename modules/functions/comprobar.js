const costos = require('./costos');
const acpm = require('./acpm');
const distances = require('./distances');
const compensacion = require('./compensacion');
const peajes = require('./peajes');
const ecuadores = require('./ecuador');

exports.comprobar = async (req) => {
    try {
        let { cliente, cargue = 2, descargue = 2, tipo_vh, observacion, ciudad_ecuador, Flete_total, distancias } = req.body;
        
        // Obtener componentes de fecha y hora
        const fechaActual = new Date();
        const año = fechaActual.getFullYear();
        const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
        const dia = String(fechaActual.getDate()).padStart(2, '0');
        const horas = String(fechaActual.getHours()).padStart(2, '0');
        const minutos = String(fechaActual.getMinutes()).padStart(2, '0');
        const segundos = String(fechaActual.getSeconds()).padStart(2, '0');
        // Formatear la fecha y hora
        const fechaHoraFormateada = `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;

        // Configurar cargue y descargue si es un viaje a Ecuador
        if (ciudad_ecuador) {
            cargue = 26;
            descargue = 26;
        }

        // Peajes /////////////////////////
        const peaje = await peajes.peajes(req);
        const valor_peaje = peaje.peajesTotales;
        req.body.peajesDist = peaje.peajes;



        // Distancia /////////////////////////
        let kilometros, distan, distancia;
        if (!distancias){
            distancia = await distances.distances(req);
            distan = distancia.Distancia;
            kilometros = distan * 1.03;
        } else {
            distancia = await distances.distances(req);
            distancia.Distancia = distancias;
            kilometros = distancias * 1.03;
        }

        // Compensación /////////////////////////
        const comp = parseFloat((await compensacion.comp(req)).compensacion);
        const peaje_comp = valor_peaje * (1 + comp);

        // Dias /////////////////////////
        const dias = (cargue / 24) + (2 + comp) * (((kilometros / 50) / 24) + ((((kilometros / 50) / 12) * 8) / 24)) + (descargue / 24)
        let dias2 = dias;
        if (dias < 1) {
            dias2 = 1;
        }


        // Lectura de Costos /////////////////////////
        const costoss = await costos.costos(req);
        const kpg = costoss["KPG"];
        req.query.kpg = kpg;
        const Acpm = await acpm.acpm(req);
        const costos_variables = parseFloat(Acpm.price) + parseFloat(costoss["variables"]);
        const depreciacion = parseFloat(costoss["depreciacion"]);
        const depre_dia = (depreciacion * dias2 / 26);
        const costos_fijos = parseFloat(costoss["fijos"]);
        const porcentaje_gsto = parseFloat(costoss["porGast"]);
        const porcentaje_ingrs = parseFloat(costoss["porIng"]);
        let costos_totales = ((costos_fijos - depreciacion) * dias / 26) + depre_dia + (costos_variables * kilometros * (1 + comp)) + peaje_comp;
        let utilidad = Flete_total - costos_totales;
        let porcentaje_utilidad = utilidad / costos_totales;
        let utili = (porcentaje_utilidad - 0.006);
        let falt = 0;
        Acpm.price = Acpm.price * kilometros * (1 + comp);

        // Compensación por faltantes /////////////////////////
        if (tipo_vh === "TM") {
            if (kilometros < 100) {
                falt = 0;
            } else if (kilometros < 200 && kilometros > 100) {
                falt = 100000;
            } else {
                falt = 150000;
            }
        } else if (tipo_vh === "DT") {
            if (kilometros < 100) {
                falt = 0;
            } else if (kilometros < 200 && kilometros > 100) {
                falt = 50000;
            } else {
                falt = 75000;
            }
        }

        // Utilidad Total /////////////////////////
        utilidad = Flete_total - (costos_totales + falt);

        // Ecuador /////////////////////////
        const ecuadore = await ecuadores.ecuador(req);
        const ecuador = ecuadore.precioLoraver;
        let porc_util_real;
        let costos_nacionales;
        if (ciudad_ecuador) {
            costos_nacionales = ((costos_fijos - depreciacion) * dias / 26) + depre_dia + (costos_variables * kilometros * (1 + comp)) + peaje_comp;
            costos_totales = ecuador + costos_nacionales;
            utilidad = Flete_total - (costos_totales + falt) - ecuador * 0.1;
            porcentaje_utilidad = utilidad / costos_totales;
            utili = (porcentaje_utilidad - 0.006);
        }

        // Iteraciones para obtener el valor del Flete
        let error = 2;
        let gst_porcentual, ings_porcentual, _utilidad;
        while (error > 0.1) {
            if (ciudad_ecuador) {
                // Costos porcentuales que dependen del ingreso y de los costos
                gst_porcentual = costos_totales * porcentaje_gsto;
                ings_porcentual = (Flete_total - ecuador) * porcentaje_ingrs + ecuador * 0.008;
                _utilidad = Flete_total - (costos_totales + falt - ecuador * 0.1);

                costos_totales = ecuador + costos_nacionales + gst_porcentual + ings_porcentual;
                utilidad = Flete_total - (costos_totales + falt - ecuador * 0.1);
                porcentaje_utilidad = utilidad / costos_totales;
                utili = (porcentaje_utilidad);

                // Medir diferencia entre iteraciones para que me saque del ciclo
                error = Math.abs(_utilidad - utilidad);
            } else {
                // Costos porcentuales que dependen del ingreso y de los costos
                gst_porcentual = costos_totales * porcentaje_gsto;
                ings_porcentual = Flete_total * porcentaje_ingrs;

                _utilidad = Flete_total - costos_totales - falt;
                costos_totales = ((costos_fijos - depreciacion) * dias / 26) + depre_dia + (costos_variables * kilometros * (1 + comp)) + peaje_comp + gst_porcentual + ings_porcentual;
                utilidad = Flete_total - costos_totales - falt;
                porcentaje_utilidad = utilidad / costos_totales;
                utili = (porcentaje_utilidad - 0.006);

                // Medir diferencia entre iteraciones para que me saque del ciclo
                error = Math.abs(_utilidad - utilidad);
            }
        }
        // Dato del EBITDA
        let ebitda = utilidad + depre_dia;

        // Función de redondeo
        function round(value, precision) {
            let multiplier = Math.pow(10, precision || 0);
            return Math.round(value * multiplier) / multiplier;
        }

        // Obtener todos los costos individuales
        let todos_fijos = {};
        for (let [key, value] of Object.entries(costoss["Costos fijos"])) {
            todos_fijos[key] = round(value * dias / 26, -3);
        }
        let todos_variables = {};
        for (let [key, value] of Object.entries(costoss["Costos Variables"])) {
            todos_variables[key] = round(value * (kilometros * (1 + comp)), -3);
        }
        let todos_porc_gsto = {};
        for (let [key, value] of Object.entries(costoss["Porcentaje Gasto"])) {
            todos_porc_gsto[key] = round(value * costos_totales, -3);
        }
        let todos_porc_ings = {};
        for (let [key, value] of Object.entries(costoss["Porcentaje Ingreso"])) {
            todos_porc_ings[key] = round(value * Flete_total, -3);
        }

        // Formato de entrega de datos
        const costeado = {
            "Tipo": "Comprobacion",
            "Fecha": fechaHoraFormateada,
            "Cliente": cliente,
            "Observacion": observacion,
            "Tipo_vehiculo": tipo_vh,
            "Compensacion": comp,
            "Dias": round(dias, 2),
            "Ingresos": {
                "Flete_total": round(Flete_total, -3),
                "EBITDA": round(ebitda, -3),
                "porcentaje_utilidad": round(utili, 2),
                "Utilidad": round(utilidad, -3),
            },
            "Costos": {
                "Costos_Totales": round(costos_totales, -3),
                "Depreciacion": round(depre_dia, -3),
                "Costos_Fijos": {
                    "Total_fijos": round((costos_fijos - depreciacion) * dias / 26, -3),
                    "todos_fijos": todos_fijos,
                },
                "Costos_Variables": {
                    "Total_variables": round((costos_variables * kilometros * (1 + comp)), -3),
                    "todos_variables": todos_variables,
                },
                "Gastos_Porcentuales": {
                    "Total_porc_gsto": round(gst_porcentual,-3),
                    "todos_porc_gsto": todos_porc_gsto,
                },
                "Ingresos_Porcentuales": {
                    "Total_porc_ings": round(ings_porcentual,-3),
                    "todos_porc_ings": todos_porc_ings,
                },
                "Ecuador": ecuadore,
                "Acpm": Acpm

            },
        };

        return { "Costeo": costeado, "Peajes": peaje, "Distancia": distancia }

    } catch (error) {
        console.log("Error al obtener la comprobacion (Function):", error);
        return (error);
    }
}