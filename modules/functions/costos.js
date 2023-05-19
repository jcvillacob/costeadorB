const XLSX = require('xlsx');
const Decimal = require('decimal.js');

exports.costos = async (req) => {
    try {
        const tipo_vh = req.body.tipo_vh;

        // Leer el archivo de Excel en un objeto JSON
        const workbook = XLSX.readFile('modules/functions/costos.xlsx');
        const sheet_name_list = workbook.SheetNames;
        const df = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

        // Filtrar los datos por la columna "Tipo"
        const df_fijos = df.filter(row => row['Tipo'] === "Fijos");
        const df_varia = df.filter(row => row['Tipo'] === "Variables");
        const df_porGast = df.filter(row => row['Tipo'] === "PorcGasto");
        const df_porIng = df.filter(row => row['Tipo'] === "PorcIngre");

        // Filtrar los datos por "Depreciacion" y "KPG"
        const df_depre = df.find(row => row['Nombre'] === "Depreciacion");
        const df_kpg = df.find(row => row['Nombre'] === "KPG");

        // Realizar cálculos y redondear
        const depreciacion = df_depre && df_depre[tipo_vh] ? new Decimal(df_depre[tipo_vh]).toFixed(4) : 0;
        const kpg = df_kpg && df_kpg[tipo_vh] ? new Decimal(df_kpg[tipo_vh]).toFixed(1) : 0;

        const suma_fijos = new Decimal(df_fijos.reduce((sum, row) => row[tipo_vh] ? sum.plus(row[tipo_vh]) : sum, new Decimal(0))).toFixed(4);
        const suma_variables = new Decimal(df_varia.reduce((sum, row) => row[tipo_vh] ? sum.plus(row[tipo_vh]) : sum, new Decimal(0))).toFixed(4);
        const porcentaje_gsto = new Decimal(df_porGast.reduce((sum, row) => row[tipo_vh] ? sum.plus(row[tipo_vh]) : sum, new Decimal(0))).toFixed(4);
        const porcentaje_ingso = new Decimal(df_porIng.reduce((sum, row) => row[tipo_vh] ? sum.plus(row[tipo_vh]) : sum, new Decimal(0))).toFixed(4);

        // Obtener el diccionario de cada "Tipo" de los datos filtrados
        const dict_fijos = Object.fromEntries(df_fijos.filter(row => row['Nombre'] !== "Depreciacion").map(row => [row['Nombre'], row[tipo_vh]]));
        const dict_variables = Object.fromEntries(df_varia.map(row => [row['Nombre'], row[tipo_vh]]));
        const dict_porcentaje_gsto = Object.fromEntries(df_porGast.map(row => [row['Nombre'], row[tipo_vh]]));
        const dict_porcentaje_ingso = Object.fromEntries(df_porIng.map(row => [row['Nombre'], row[tipo_vh]]));

        return { "fijos": suma_fijos, "variables": suma_variables, "porGast": porcentaje_gsto, "porIng": porcentaje_ingso, "depreciacion": depreciacion, "KPG": kpg, "Costos fijos": dict_fijos, "Costos Variables": dict_variables, "Porcentaje Gasto": dict_porcentaje_gsto, "Porcentaje Ingreso": dict_porcentaje_ingso };
    } catch (error) {
        console.error('Error al obtener los costos (Functions):', error);
        return ({ error: 'Error al obtener los costos (Functions)' });
    }
}