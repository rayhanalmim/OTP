import { Request, Response } from "express";
import { generate } from "@pdfme/generator";
import { Designer, Form, Viewer } from "@pdfme/ui";
import { Template, BLANK_PDF } from "@pdfme/common";
import AWS from "aws-sdk";
import {
  text,
  image,
  barcodes,
  line,
  readOnlyText,
  readOnlyImage,
  tableBeta,
} from "@pdfme/schemas";
import config from "../../config";
import { PDFDocument } from "pdf-lib"; // Temporarily using pdf-lib for merging
import { images } from "./images";
import { PdfDataModel } from "./pdf.model";

// Configure AWS
AWS.config.update({
  accessKeyId: config.aws_access_key_id,
  secretAccessKey: config.aws_secret_access_key,
  region: config.aws_region,
  signatureVersion: "v4",
});

const s3 = new AWS.S3();

const secondPdf = async (req: Request, res: Response) => {
  try {
    const {
      userName,
      CC,
      savingType,
      UserUID,
      typeOfContract,
      totalDepositValue,
      company,
    } = req.body;

    const isexists = await PdfDataModel.findOne({ UserUID });

    if (isexists) {
      const result = await PdfDataModel.updateOne(
        { UserUID: UserUID },
        {
          $set: {
            userName: userName,
            CC: CC,
            savingType: savingType,
            typeOfContract: typeOfContract,
            totalDepositValue: totalDepositValue,
            company: company,
          },
        }
      );
    } else {
      const result = await PdfDataModel.create({
        userName,
        UserUID,
        CC,
        typeOfContract,
        savingType,
        totalDepositValue,
        company,
      });
    }

    // --------------------------------------------------date
    // Get current date and time in Colombian time zone
    const currentDate = new Date();

    // Options for formatting date to get components
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "numeric",
      year: "numeric",
      timeZone: "America/Bogota",
    };

    // Format the date using the options
    const formattedDateParts = new Intl.DateTimeFormat(
      "es-ES",
      options
    ).formatToParts(currentDate);

    // Extract and map the parts, with default values to avoid undefined
    const day =
      formattedDateParts.find((part) => part.type === "day")?.value || "01";
    const month =
      formattedDateParts.find((part) => part.type === "month")?.value || "1";
    const year =
      formattedDateParts.find((part) => part.type === "year")?.value || "2024";

    // Define month names in uppercase (in Spanish)
    const monthNames = [
      "ENERO",
      "FEBRERO",
      "MARZO",
      "ABRIL",
      "MAYO",
      "JUNIO",
      "JULIO",
      "AGOSTO",
      "SEPTIEMBRE",
      "OCTUBRE",
      "NOVIEMBRE",
      "DICIEMBRE",
    ];

    // Convert month number to month name (adjust index by -1 since array is 0-based)
    const monthIndex = parseInt(month) - 1;
    const monthName = monthNames[monthIndex] || "ENERO";

    // Combine the parts to get the desired format
    const formattedDate = `${day} ${monthName} ${year}`;
    const plugins = {
      text,
      image,
      readOnlyImage,
      qrcode: barcodes.qrcode,
      line,
      readOnlyText,
      tableBeta,
    };

    const template1: Template = {
      schemas: [
        {
          HEAD: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content: "CONTRATO DE AHORRO - LINEAS",
            position: { x: 65.7, y: 27.8 },
            width: 78.6,
            height: 6.29,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          HEADTWO: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content: "FIMUTUAL",
            position: { x: 91.37, y: 37.8 },
            width: 27.27,
            height: 6.29,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          SIDETEXT: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content: "Fecha:",
            position: { x: 175.11, y: 47.8 },
            width: 15.89,
            height: 6.29,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 12,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          TABLEHEADER: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content: "Información de Titularidad del asociado",
            position: { x: 63.06, y: 60.8 },
            width: 83.89,
            height: 6.29,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 12,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          TABLE: {
            type: "table",
            position: { x: 19.56, y: 74.24 },
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-table"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>',
            width: 170.89,
            height: 68.6936,
            content:
              '[["Direccion Domicilio","DATO AUTOMANTIOO"],["Paisde nacimiento","DATO AUTOMANTIOO"],["Tipo Documento","DATO AUTOMANTIOO"],["Fecha de nacimiento","DATO AUTOMANTIOO"],["Email","DATO AUTOMANTIOO"],["Numero de documento","DATO AUTOMANTIOO"],["Fecha y lugarde expedidion documento","DATO AUTOMANTIOO"],["Telefono","DATO AUTOMANTIOO"]]',
            showHead: true,
            head: ["Nombresy apellidos", "DATO AUTOMANTIOO"],
            headWidthPercentages: [46.63146584804297, 53.36853415195703],
            tableStyles: { borderWidth: 0.3, borderColor: "#000000" },
            headStyles: {
              fontName: "NotoSerifJP-Regular",
              fontSize: 10,
              characterSpacing: 0,
              alignment: "left",
              verticalAlignment: "middle",
              lineHeight: 0.7,
              fontColor: "#000000",
              borderColor: "",
              backgroundColor: "#ffffff",
              borderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
              padding: { top: 3, right: 5, bottom: 3, left: 5 },
            },
            bodyStyles: {
              fontName: "NotoSerifJP-Regular",
              fontSize: 10,
              characterSpacing: 0,
              alignment: "left",
              verticalAlignment: "middle",
              lineHeight: 1,
              fontColor: "#000000",
              borderColor: "#888888",
              backgroundColor: "",
              alternateBackgroundColor: "#f5f5f5",
              borderWidth: {
                top: 0.1,
                right: 0.1,
                bottom: 0.1,
                left: 0.1,
              },
              padding: { top: 2, right: 5, bottom: 2, left: 5 },
            },
            columnStyles: { alignment: { "0": "left", "1": "center" } },
          },
          H3: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content: "CLAUSULAS",
            position: { x: 89.91, y: 153.8 },
            width: 30.18,
            height: 6.29,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          TEXTONE: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "ASOCIADO, con la firma de este contrato de apertura de LINEA DEAHORRO, confirmo que acepto las siguientes clausulas:",
            position: { x: 20.28, y: 163.74 },
            width: 171.46,
            height: 16.87,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1.5,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          TEXTTWO: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "PRIMERO: La información aquí suministrada por mí es confidencial ynecesaria para la vinculación como asociado ahorrador en FIMUTUAL, lagestión y aprobación de cualquier producto u operación y/o la atencióndemis solicitudes, peticiones, quejas o reclamos. Declaro que la informaciónsuministrada en el Sitio Web o la Aplicación es de mi titularidad, concuerdacon la realidad y asumo plena responsabilidad por la veracidad deesta;\ncualquier inexactitud podrá acarrear las consecuencias expuestas enel\nReglamento de productos, sin responsabilidad alguna por parte de FIMUTUAL, frente a terceros. Reconozco y acepto que en el evento que la informaciónpor",
            position: { x: 20.28, y: 180.74 },
            width: 171.46,
            height: 77.72,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1.5,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          footerOne: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "Este documento incorpora firma electronica, de acuerdo a la ley N° 51 de 22de",
            position: { x: 17.68, y: 268.42 },
            width: 174.64,
            height: 8.41,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
          },
          footerTwo: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content: "julio 2008",
            position: { x: 93.75, y: 275.42 },
            width: 22.5,
            height: 7.61,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
        },
      ],
      basePdf: { width: 210, height: 297, padding: [0, 0, 0, 0] },
    };

    const template2: Template = {
      schemas: [
        {
          TEXTONE: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "mí suministrada en este Sitio Web o aplicación no sea de mi propiedad,\ninduzca a una falsedad personal o sea violatoria del bien jurídico tuteladodenominado “de la protección de la información y de los datos” podré incurrir en tipos penales previstos por la legislación colombiana.",
            position: { x: 19.24, y: 17.53 },
            width: 171.26,
            height: 31.96,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1.6,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          TEXTTWO: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "Así mismo, entiendo que autorizo a FIMUTUAL con relación a:",
            position: { x: 19.24, y: 62.53 },
            width: 171.52,
            height: 10,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1.4,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          TEXTTHREE: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "I. Autorización Reporte y Consulta de Información ante los OperadoresdeBancos de Datos de Información Financiera y/o Crediticia (Ley 1266de2008y Ley 2157 de 2021). Autorizo de FIMUTUAL, como responsabledel\nTratamiento; sus Encargados del Tratamiento; a quien él les haya transmitidoo transferido la información, incluyendo la transferencia a terceros países, aliados, y/o a quien el futuro ostente sus derechos, para que obtenga todalainformación relativa a mis datos personales financieros, crediticios, comerciales y de servicios registrados ante cualquier banco de datos, mi\ncomportamiento crediticio y comercial, el cumplimiento de mis obligaciones, en el sector financiero y real, datos financieros e información relacionadaconmi situación laboral e ingresos salariales ante operadores de informacióncrediticia, de seguridad social, administradoras de fondos y cesantías, centrales de riesgo, notarías, Registraduría Nacional del EstadoCivil, Contraloría General de la República, Procuraduría General de la Nación, DIAN, Oficinas de Registro, cajas de compensación, proveedores tecnológicosdeNómina y Facturación electrónica, Administradoras de Fondos de Pensionesyde Cesantías y Operadores de Información a través de las cuales se liquidancesantías, aportes de seguridad social y parafiscales, tales como AportesenLínea, SOI, SIMPLE, PILA, entre otras; así mismo para que solicitenoverifiquen información sobre mis activos, bienes o derechos en entidadespúblicas o privadas, o información que se encuentre en buscadores públicos,",
            position: { x: 19.24, y: 74.53 },
            width: 171.26,
            height: 178.01,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1.6,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          footerOne: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "Este documento incorpora firma electronica, de acuerdo a la ley N° 51 de 22de",
            position: { x: 17.68, y: 268.42 },
            width: 174.64,
            height: 8.41,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
          },
          footerTwo: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content: "julio 2008",
            position: { x: 93.75, y: 275.42 },
            width: 22.5,
            height: 7.61,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
        },
      ],
      basePdf: { width: 210, height: 297, padding: [0, 0, 0, 0] },
    };

    const template3: Template = {
      schemas: [
        {
          TEXTONE: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "listas restrictivas, listas vinculantes para Colombia, redes socialesopublicaciones físicas o electrónicas, bien fuere en Colombia o en el exterior. El resultado del análisis para acceder al producto me será informado atravésde alguno de los medios de contacto que he suministrado. De igual manera, autorizo, para que, con fines estadísticos, de control, supervisiónydeinformación, reporte a las Centrales de Información, mis datos de contacto, el\ndesarrollo, novedades, extinción y cumplimiento de las obligaciones contraídaso que llegue a contraer con FIMUTUAL y/o a quien el futuro ostentesusderechos. Estas autorizaciones de reporte y consulta de información tendránlas mismas finalidades legítimas estipuladas para el tratamientodeinformación personal cuya autorización y detalle se señala a continuación.",
            position: { x: 19.24, y: 21.53 },
            width: 171.26,
            height: 97.57,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1.6,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          TEXTTHREE: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "II. Autorización para el Tratamiento de la Información Personal (Ley 1581 de2012). Sin perjuicio del derecho que me asiste a escoger los canalesdecontacto y habiendo sido debidamente informado sobre los mediosdecomunicación que serán utilizados por FIMUTUAL para el ejerciciodelarelación contractual y comercial, autorizo de manera libre, voluntaria, expresae informada a FIMUTUAL en calidad de Responsable del Tratamiento; asusencargados del tratamiento o a quien la asociación les haya transmitidootransferido la información, incluyendo la transferencia a terceros países, y/oaquien en el futuro ostente sus derechos, a ser contactado utilizandolainformación suministrada en el presente Formulario para las finalidadesprevistas en este documento, a través de los siguientes canales: i) líneatelefónica; ii) correo electrónico; iii) Servicio de Mensajes Cortos (SMS); iv)\naplicaciones de mensajería instantánea o formal; y/o v) redes sociales. Declaro conocer y entender que, en caso de que requiera actualizar omodificar mis canales de contacto, puedo realizarlo a través de las Líneasautorizadas e informadas en la página WEB de la asociación. Autorizoa",
            position: { x: 19.24, y: 123.53 },
            width: 171.26,
            height: 134.35,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1.6,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          footerOne: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "Este documento incorpora firma electronica, de acuerdo a la ley N° 51 de 22de",
            position: { x: 17.68, y: 268.42 },
            width: 174.64,
            height: 8.41,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
          },
          footerTwo: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content: "julio 2008",
            position: { x: 93.75, y: 275.42 },
            width: 22.5,
            height: 7.61,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
        },
      ],
      basePdf: { width: 210, height: 297, padding: [0, 0, 0, 0] },
    };

    const template4: Template = {
      schemas: [
        {
          TEXTONE: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "FIMUTUAL, en calidad de responsable del Tratamiento; a sus Encargadosdel\nTratamiento o a quien haya transmitido o transferido la información, aliadosy/o a quien el futuro ostente sus derechos, incluyendo la transferenciaaterceros países, y/o a quien en el futuro ostente sus derechos, para quellevea cabo el tratamiento de mis datos personales, incluyendo datos biométricos. En virtud de dicha autorización de tratamiento, FIMUTUAL podrá solicitar, consultar, compartir, recolectar, almacenar, informar, usar, circular, reportar, transferir, trasmitir, procesar, divulgar, rectificar, modificar, aclarar, retirar, suprimir y/o actualizar mis datos e información personal, la cual, essuministrada por mí a través de todos los canales de contacto con FIMUTUAL, así como la página web. Así mismo, autorizo a FIMUTUAL, en calidadderesponsable del Tratamiento; a sus Encargados del Tratamiento o a quienél\nles haya transmitido o transferido la información, aliados, incluyendolatransferencia a terceros países, y/o a quien el futuro ostente sus derechos, para que de forma directa o a través de una entidad certificadacomooperador biométrico, realice la validación de mi identidad y mis característicasfísicas (huellas dactilares y/o rostro). Declaro que conozco y entiendoquenoestoy obligado a suministrar y/o autorizar el tratamiento de los datospersonales de menores de edad. De igual manera, declaro que conozcoyentiendo que no estoy obligado a suministrar y/o autorizar el tratamientodedatos personales sensibles; no obstante, autorizo a FIMUTUAL el tratamientode estos datos, de conformidad con lo establecido en el Artículo 5 y 6delaLey 1581 de 2023 y el Artículo 6 del Decreto 1377 de 2013, incluyendodeforma expresa mis datos biométricos y los datos asociados al origen racial oétnico, exclusivamente para las finalidades previstas en el presentedocumento; así mismo, conozco que la información biométrica consultadaenlas bases de datos respectivas no podrá ser almacenada, ni usadaporaplicaciones de mensajería instantánea o formal; y/o v) redes sociales. Declaro conocer y entender que, en caso de que requiera actualizar omodificar mis canales de contacto, puedo realizarlo a través de las Líneasautorizadas e informadas en la página WEB de la asociación. Autorizoa",
            position: { x: 19.24, y: 18.53 },
            width: 171.26,
            height: 245.47,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1.6,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          footerOne: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "Este documento incorpora firma electronica, de acuerdo a la ley N° 51 de 22de",
            position: { x: 17.68, y: 268.42 },
            width: 174.64,
            height: 8.41,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
          },
          footerTwo: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content: "julio 2008",
            position: { x: 93.75, y: 275.42 },
            width: 22.5,
            height: 7.61,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
        },
      ],
      basePdf: { width: 210, height: 297, padding: [0, 0, 0, 0] },
      pdfmeVersion: "4.0.0",
    };

    const template5: Template = {
      schemas: [
        {
          TEXTONE: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "FIMUTUAL, sus Encargados del Tratamiento o a quien él les haya transmitidoo transferido la información, aliados, incluyendo la transferencia a tercerospaíses y/o a quien el futuro ostente sus derechos, para complementar otrasbases de datos, ni para fines distintos a los expresados en la presenteautorización y en la Ley. Mis datos e información personal, debidamenteautorizados a través del presente formulario, podrán ser sujetosdetratamiento por FIMUTUAL, sus Encargados del Tratamiento o a quienél leshaya transmitido o transferido la información, aliados, incluyendolatransferencia a terceros países y/o a quien el futuro ostente sus derechos, enconsecuencia, acepto ser contactado(a) mediante: i) línea telefónica; ii) correoelectrónico; iii) Servicio de Mensajes Cortos (SMS); iv) v) aplicacionesdemensajería instantánea o formal; y/o vi) redes sociales. El tratamientopor lapresente autorización permitido a FIMUTUAL, sus Encargados del Tratamientoo a quien él les haya transmitido o transferido la información, aliados,\nincluyendo la transferencia a terceros países y/o a quien el futuro ostentesusderechos podrá tener por objeto las finalidades legitimas de: i) cumplir lasobligaciones contractuales y reglamentarias, prevención del lavado de activosy financiación del terrorismo, así como para la prestación de los servicioscontratados; ii) atender y dar solución a las solicitudes, peticiones, quejasoreclamos formulados a FIMUTUAL; iii) crear y actualizar los perfilestransaccionales; iv) realizar gestiones de cobranza; v) informar sobreloscambios realizados a los productos y servicios del portafolio de FIMUTUAL; vi)\nanalizar las tendencias y comportamientos de consumo de los consumidoresfinancieros; vii) para mi vinculación como cliente y/o prospecto, aprobaciónde operaciones de crédito, apertura y/o uso de los servicios y/o productosofrecidos por FIMUTUAL; viii) recibir información sobre campañas, estrategias promocionales, ofertas comerciales y publicidad de productosde",
            position: { x: 19.24, y: 21.53 },
            width: 171.26,
            height: 224.04,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1.6,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          footerOne: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "Este documento incorpora firma electronica, de acuerdo a la ley N° 51 de 22de",
            position: { x: 17.68, y: 268.42 },
            width: 174.64,
            height: 8.41,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
          },
          footerTwo: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content: "julio 2008",
            position: { x: 93.75, y: 275.42 },
            width: 22.5,
            height: 7.61,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
        },
      ],
      basePdf: { width: 210, height: 297, padding: [0, 0, 0, 0] },
      pdfmeVersion: "4.0.0",
    };

    const template6: Template = {
      schemas: [
        {
          TEXTONE: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "FIMUTUAL y de aliados de éste, sean éstas presentes o futuras; ix) recibir\ncualquier tipo de información y/o comunicación que FIMUTUALestimenecesario y general, para que se adelanten todos los procesosderelacionamiento (soportados o no en tecnología), para un abordajeyconocimiento integral del cliente de todos mis productos y solucionescontratadas con FIMUTUAL, entre otros permitidos por la Ley. Conozcoyentiendo que como Titular de la información tengo derecho a conocer, actualizar, rectificar mis datos personales, solicitar prueba de la autorizaciónotorgada para el tratamiento de la información, informarme sobre el usoquese ha dado a los mismos, revocar la autorización, solicitar la supresióndemisdatos cuando sea procedente y acceder en forma gratuita a los mismos. Conozco que, para ejercer los derechos sobre mis datos personales podrécomunicarme a las Líneas de Atención suministradas en la página WEB. Paraconocer la Política de Protección de Datos Personales y Política de Cobranzas, podré ingresar a la pagina WEB.",
            position: { x: 19.24, y: 21.53 },
            width: 171.26,
            height: 112.91,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1.6,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          "TEXTONE copy": {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "III. Autorización para Compartir Datos Personales con EntidadesPertenecientes al Grupo Económico, vinculados económicos, personasjurídicas o naturales, con base en las disposiciones de FIMUTUAL. AutorizoaFIMUTUAL y/o a cualquier otra Entidad o Unidad de Negocio internaquerepresente sus derechos, a compartir mi información personal, financiera, crediticia y comercial como Cliente de FIMUTUAL con cualquiera otra personao Entidad Vinculada al Grupo Económico al que pertenece y/o llegueapertenecer FIMUTUAL o la Entidad que represente sus derechos, para realizar\nel mismo tratamiento y con las mismas finalidades mencionadas en el numeral\nanterior. Declaro haber leído el contenido de este documento, así comocomprenderlo en su alcance e implicación, aceptando los TérminosyCondiciones. El documento y mi aceptación tendrán validez marcandola",
            position: { x: 19.24, y: 141.53 },
            width: 171.26,
            height: 112.91,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1.6,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          footerOne: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "Este documento incorpora firma electronica, de acuerdo a la ley N° 51 de 22de",
            position: { x: 17.68, y: 268.42 },
            width: 174.64,
            height: 8.41,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
          },
          footerTwo: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content: "julio 2008",
            position: { x: 93.75, y: 275.42 },
            width: 22.5,
            height: 7.61,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
        },
      ],
      basePdf: { width: 210, height: 297, padding: [0, 0, 0, 0] },
      pdfmeVersion: "4.0.0",
    };

    const template7: Template = {
      schemas: [
        {
          TEXTONE: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "casilla de aceptación en el formulario de solicitud de FIMUTUAL y/o dequienen el futuro represente u ostente sus derechos, así como, sus obligaciones. Las definiciones contenidas en la presente autorización que se encuentrenenmayúscula tendrán el significado que así se haya determinado en la Políticade Protección de Datos Personales de FIMUTUAl, la cual podrá ser consultadaen la página web.",
            position: { x: 19.24, y: 21.53 },
            width: 171.26,
            height: 46.23,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1.6,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          "TEXTONE copy": {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "SEGUNDO: Declaración de origen de Fondos- Declaro que: a.) Mis recursostienen un origen lícito y provienen directamente del desarrollo de la actividadeconómica y ocupación señalada en la sección actividad económica. b.) Losingresos aquí reportados, no provienen de ninguna actividad ilícita delascontempladas en el código penal colombiano o en cualquier otra normaconcordante. c.) No admitiré que terceros efectúen depósitos a nombremíoen los productos solicitados, de los cuales desconozca su origen.",
            position: { x: 19.24, y: 73.53 },
            width: 171.26,
            height: 60.52,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1.6,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          "TEXTONE copy 2": {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "TERCERO: Acepto el reglamento de AHORRO FIMUTUAL, Acuerdo002aprobado por junta directiva, el cual me fue informado durante el procesorealizado.",
            position: { x: 19.24, y: 141.53 },
            width: 171.26,
            height: 23.21,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1.6,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          "TEXTONE copy 3": {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "CUARTO: Acepto que los extractos y otras comunicaciones con FIMUTUALsean enviadas al buzón de mi servicio a través de la APP o pagina WEB",
            position: { x: 19.24, y: 171.53 },
            width: 171.26,
            height: 23.21,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1.6,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          "TEXTONE copy 4": {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "QUINTO: Declaro que no soy una persona expuesta políticamente en Colombiani en ningún país diferente a Colombia, ni soy cónyuge, ni familiar hastael\nsegundo grado de consanguinidad o segundo de afinidad o primerocivil deuna persona expuesta políticamente. Igualmente declaro que noestoycobijado por el articulo 30-A de la Ley 1908 de 2019, ni tengo residenciafiscal en ningún país diferente a Colombia.",
            position: { x: 19.24, y: 202.53 },
            width: 171.26,
            height: 54.43,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1.6,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          footerOne: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "Este documento incorpora firma electronica, de acuerdo a la ley N° 51 de 22de",
            position: { x: 17.68, y: 268.42 },
            width: 174.64,
            height: 8.41,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
          },
          footerTwo: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content: "julio 2008",
            position: { x: 93.75, y: 275.42 },
            width: 22.5,
            height: 7.61,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
        },
      ],
      basePdf: { width: 210, height: 297, padding: [0, 0, 0, 0] },
      pdfmeVersion: "4.0.0",
    };

    const template8: Template = {
      schemas: [
        {
          TEXTONE: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "SEXTO: En observancia del artículo 7 del Decreto 2364 de 2012, convengocon FIMUTUAL y acepto que el presente documento será firmadoelectrónicamente mediante el mecanismo OTP (One Time Password) digitadoen un dispositivo móvil, ordenador u otra herramienta que autorice FIMUTUAL, reconociendo que dicha firma tiene los mismos efectos de mi firmamanuscrita, cumpliendo con los atributos dispuestos en el parágrafodel\nartículo 28 de la Ley 527 de 1999 y el citado Decreto Reglamentario. Paraestos efectos, manifiesto que: I). Leí y verifiqué el presente documento; II). Mantendré actualizados en todo momento los datos del celular personal yel\ncorreo electrónico; III). Y reportaré de forma inmediata cualquier circunstanciaque pueda poner en riesgo la seguridad de la OTP. Para todos los efectos, losdocumentos firmados electrónicamente serán custodiados por FIMUTUALy/ola empresa que haga sus veces en este proceso.",
            position: { x: 19.24, y: 23.53 },
            width: 171.26,
            height: 100.73,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1.6,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
          footerOne: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content:
              "Este documento incorpora firma electronica, de acuerdo a la ley N° 51 de 22de",
            position: { x: 17.68, y: 268.42 },
            width: 174.64,
            height: 8.41,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
          },
          footerTwo: {
            type: "readOnlyText",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
            content: "julio 2008",
            position: { x: 93.75, y: 275.42 },
            width: 22.5,
            height: 7.61,
            rotate: 0,
            alignment: "left",
            verticalAlignment: "top",
            fontSize: 13,
            lineHeight: 1,
            characterSpacing: 0,
            fontColor: "#000000",
            backgroundColor: "",
            opacity: 1,
            readOnly: true,
            fontName: "NotoSerifJP-Regular",
          },
        },
      ],
      basePdf: { width: 210, height: 297, padding: [0, 0, 0, 0] },
      pdfmeVersion: "4.0.0",
    };

    // second template -----------------------------------------

    const input1 = [
      {
        HEAD: "CONTRATO DE AHORRO - LINEAS",
        HEADTWO: "FIMUTUAL",
        SIDETEXT: "Fecha:",
        TABLEHEADER: "readOnlyText",
        TABLE:
          '[["Direccion Domicilio","DATO AUTOMANTIOO"],["Paisde nacimiento","DATO AUTOMANTIOO"],["Tipo Documento","DATO AUTOMANTIOO"],["Fecha de nacimiento","DATO AUTOMANTIOO"],["Email","DATO AUTOMANTIOO"],["Numero de documento","DATO AUTOMANTIOO"],["Fecha y lugarde expedidion documento","DATO AUTOMANTIOO"],["Telefono","DATO AUTOMANTIOO"]]',
        H3: "CLAUSULAS",
        TEXTONE: "readOnlyText",
        TEXTTWO:
          "PRIMERO: La información aquí suministrada por mí es confidencial ynecesaria para la vinculación como asociado ahorrador en FIMUTUAL, lagestión y aprobación de cualquier producto u operación y/o la atencióndemis solicitudes, peticiones, quejas o reclamos. Declaro que la informaciónsuministrada en el Sitio Web o la Aplicación es de mi titularidad, concuerdacon la realidad y asumo plena responsabilidad por la veracidad deesta;\ncualquier inexactitud podrá acarrear las consecuencias expuestas enel\nReglamento de productos, sin responsabilidad alguna por parte de FIMUTUAL, frente a terceros. Reconozco y acepto que en el evento que la informaciónpor",
      },
    ];

    const input2 = [
      {
        TEXTONE:
          "mí suministrada en este Sitio Web o aplicación no sea de mi propiedad,\ninduzca a una falsedad personal o sea violatoria del bien jurídico tuteladodenominado “de la protección de la información y de los datos” podré incurrir en tipos penales previstos por la legislación colombiana.",
        TEXTTWO: "Así mismo, entiendo que autorizo a FIMUTUAL con relación a:",
        TEXTTHREE:
          "I. Autorización Reporte y Consulta de Información ante los OperadoresdeBancos de Datos de Información Financiera y/o Crediticia (Ley 1266de2008y Ley 2157 de 2021). Autorizo de FIMUTUAL, como responsabledel\nTratamiento; sus Encargados del Tratamiento; a quien él les haya transmitidoo transferido la información, incluyendo la transferencia a terceros países, aliados, y/o a quien el futuro ostente sus derechos, para que obtenga todalainformación relativa a mis datos personales financieros, crediticios, comerciales y de servicios registrados ante cualquier banco de datos, mi\ncomportamiento crediticio y comercial, el cumplimiento de mis obligaciones, en el sector financiero y real, datos financieros e información relacionadaconmi situación laboral e ingresos salariales ante operadores de informacióncrediticia, de seguridad social, administradoras de fondos y cesantías, centrales de riesgo, notarías, Registraduría Nacional del EstadoCivil, Contraloría General de la República, Procuraduría General de la Nación, DIAN, Oficinas de Registro, cajas de compensación, proveedores tecnológicosdeNómina y Facturación electrónica, Administradoras de Fondos de Pensionesyde Cesantías y Operadores de Información a través de las cuales se liquidancesantías, aportes de seguridad social y parafiscales, tales como AportesenLínea, SOI, SIMPLE, PILA, entre otras; así mismo para que solicitenoverifiquen información sobre mis activos, bienes o derechos en entidadespúblicas o privadas, o información que se encuentre en buscadores públicos,",
      },
    ];

    // Generate both PDFs
    const pdf1 = await generate({
      template: template1,
      plugins,
      inputs: input1,
    });
    const pdf2 = await generate({
      template: template2,
      plugins,
      inputs: input2,
    });
    const pdf3 = await generate({
      template: template3,
      plugins,
      inputs: input1,
    });
    const pdf4 = await generate({
      template: template4,
      plugins,
      inputs: input1,
    });
    const pdf5 = await generate({
      template: template5,
      plugins,
      inputs: input1,
    });
    const pdf6 = await generate({
      template: template6,
      plugins,
      inputs: input1,
    });
    const pdf7 = await generate({
      template: template7,
      plugins,
      inputs: input1,
    });
    const pdf8 = await generate({
      template: template8,
      plugins,
      inputs: input1,
    });

    // Load both PDFs into PDF-lib
    const pdfDoc1 = await PDFDocument.load(pdf1);
    const pdfDoc2 = await PDFDocument.load(pdf2);
    const pdfDoc3 = await PDFDocument.load(pdf3);
    const pdfDoc4 = await PDFDocument.load(pdf4);
    const pdfDoc5 = await PDFDocument.load(pdf5);
    const pdfDoc6 = await PDFDocument.load(pdf6);
    const pdfDoc7 = await PDFDocument.load(pdf7);
    const pdfDoc8 = await PDFDocument.load(pdf8);

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Copy pages from the first PDF document 1
    const copiedPages1 = await mergedPdf.copyPages(
      pdfDoc1,
      pdfDoc1.getPageIndices()
    );
    copiedPages1.forEach((page) => {
      mergedPdf.addPage(page);
    });

    // Copy pages from the second PDF document 2
    const copiedPages2 = await mergedPdf.copyPages(
      pdfDoc2,
      pdfDoc2.getPageIndices()
    );
    copiedPages2.forEach((page) => {
      mergedPdf.addPage(page);
    });

    // Copy pages from the second PDF document 3
    const copiedPages3 = await mergedPdf.copyPages(
      pdfDoc3,
      pdfDoc3.getPageIndices()
    );
    copiedPages3.forEach((page) => {
      mergedPdf.addPage(page);
    });

    // Copy pages from the second PDF document 4
    const copiedPages4 = await mergedPdf.copyPages(
      pdfDoc4,
      pdfDoc4.getPageIndices()
    );
    copiedPages4.forEach((page) => {
      mergedPdf.addPage(page);
    });

    // Copy pages from the second PDF document 5
    const copiedPages5 = await mergedPdf.copyPages(
      pdfDoc5,
      pdfDoc5.getPageIndices()
    );
    copiedPages5.forEach((page) => {
      mergedPdf.addPage(page);
    });

    // Copy pages from the second PDF document 6
    const copiedPages6 = await mergedPdf.copyPages(
      pdfDoc6,
      pdfDoc6.getPageIndices()
    );
    copiedPages6.forEach((page) => {
      mergedPdf.addPage(page);
    });

    // Copy pages from the second PDF document 7
    const copiedPages7 = await mergedPdf.copyPages(
      pdfDoc7,
      pdfDoc7.getPageIndices()
    );
    copiedPages7.forEach((page) => {
      mergedPdf.addPage(page);
    });

    // Copy pages from the second PDF document 8
    const copiedPages8 = await mergedPdf.copyPages(
      pdfDoc8,
      pdfDoc8.getPageIndices()
    );
    copiedPages8.forEach((page) => {
      mergedPdf.addPage(page);
    });

    // Serialize the merged PDF to bytes (Buffer)
    const mergedPdfBytes = await mergedPdf.save();

    // Define the upload parameters
    const uploadParams = {
      Bucket: "upload-pdf-v33",
      Key: `pdfs/${Date.now()}-output.pdf`,
      Body: Buffer.from(mergedPdfBytes),
      ContentType: "application/pdf",
    };

    // Upload the merged PDF to S3
    s3.upload(uploadParams, async (uploadErr: any, data: any) => {
      if (uploadErr) {
        console.error("Error uploading to S3:", uploadErr);
        return res.status(500).json({
          success: false,
          message: "Failed to upload PDF to S3",
          error: uploadErr,
        });
      }

      // Generate a pre-signed URL for the uploaded PDF
      const signedUrl = await s3.getSignedUrlPromise("getObject", {
        Bucket: "upload-pdf-v33",
        Key: uploadParams.Key,
        Expires: 60 * 5, // Link expires in 5 minutes
      });

      res.json({
        downloadUrl: signedUrl,
        message: "PDF generated and uploaded successfully",
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error: error,
    });
  }
};

export const SecondPdfController = {
  secondPdf,
};
