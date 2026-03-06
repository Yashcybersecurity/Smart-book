/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/head */ \"next/head\");\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_script__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/script */ \"./node_modules/next/script.js\");\n/* harmony import */ var next_script__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_script__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var next_auth_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next-auth/react */ \"next-auth/react\");\n/* harmony import */ var next_auth_react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(next_auth_react__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_5__);\n\n\n\n\n\n\nfunction App({ Component, pageProps: { session, ...pageProps } }) {\n    // Register Service Worker on mount\n    (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(()=>{\n        if (\"serviceWorker\" in navigator) {\n            navigator.serviceWorker.register(\"/sw.js\").catch(()=>{\n            // SW registration failed — non-critical\n            });\n        }\n    }, []);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_auth_react__WEBPACK_IMPORTED_MODULE_4__.SessionProvider, {\n        session: session,\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_head__WEBPACK_IMPORTED_MODULE_1___default()), {\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        charSet: \"utf-8\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ASUS\\\\Desktop\\\\smartz\\\\smartbook\\\\smartbook\\\\pages\\\\_app.js\",\n                        lineNumber: 20,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"viewport\",\n                        content: \"width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ASUS\\\\Desktop\\\\smartz\\\\smartbook\\\\smartbook\\\\pages\\\\_app.js\",\n                        lineNumber: 21,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"apple-mobile-web-app-capable\",\n                        content: \"yes\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ASUS\\\\Desktop\\\\smartz\\\\smartbook\\\\smartbook\\\\pages\\\\_app.js\",\n                        lineNumber: 22,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"apple-mobile-web-app-status-bar-style\",\n                        content: \"black-translucent\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ASUS\\\\Desktop\\\\smartz\\\\smartbook\\\\smartbook\\\\pages\\\\_app.js\",\n                        lineNumber: 23,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"mobile-web-app-capable\",\n                        content: \"yes\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ASUS\\\\Desktop\\\\smartz\\\\smartbook\\\\smartbook\\\\pages\\\\_app.js\",\n                        lineNumber: 24,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"format-detection\",\n                        content: \"telephone=no\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ASUS\\\\Desktop\\\\smartz\\\\smartbook\\\\smartbook\\\\pages\\\\_app.js\",\n                        lineNumber: 25,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"theme-color\",\n                        content: \"#111827\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ASUS\\\\Desktop\\\\smartz\\\\smartbook\\\\smartbook\\\\pages\\\\_app.js\",\n                        lineNumber: 26,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"description\",\n                        content: \"Compare rides across Uber, Ola, Rapido, Namma Yatri and more. Find the cheapest and fastest ride instantly.\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ASUS\\\\Desktop\\\\smartz\\\\smartbook\\\\smartbook\\\\pages\\\\_app.js\",\n                        lineNumber: 27,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"link\", {\n                        rel: \"manifest\",\n                        href: \"/manifest.json\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ASUS\\\\Desktop\\\\smartz\\\\smartbook\\\\smartbook\\\\pages\\\\_app.js\",\n                        lineNumber: 28,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"link\", {\n                        rel: \"icon\",\n                        href: \"/icons/icon-192x192.png\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ASUS\\\\Desktop\\\\smartz\\\\smartbook\\\\smartbook\\\\pages\\\\_app.js\",\n                        lineNumber: 29,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"link\", {\n                        rel: \"apple-touch-icon\",\n                        href: \"/icons/icon-192x192.png\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ASUS\\\\Desktop\\\\smartz\\\\smartbook\\\\smartbook\\\\pages\\\\_app.js\",\n                        lineNumber: 30,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"title\", {\n                        children: \"FAREXO – Ride Comparison\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ASUS\\\\Desktop\\\\smartz\\\\smartbook\\\\smartbook\\\\pages\\\\_app.js\",\n                        lineNumber: 31,\n                        columnNumber: 9\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Users\\\\ASUS\\\\Desktop\\\\smartz\\\\smartbook\\\\smartbook\\\\pages\\\\_app.js\",\n                lineNumber: 19,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_script__WEBPACK_IMPORTED_MODULE_2___default()), {\n                src: `https://maps.googleapis.com/maps/api/js?key=${\"AIzaSyD4aeA_aF2j1wMJ43l8AQgRY-stFFkYM4A\" || 0}&libraries=places,marker&loading=async`,\n                strategy: \"afterInteractive\"\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\ASUS\\\\Desktop\\\\smartz\\\\smartbook\\\\smartbook\\\\pages\\\\_app.js\",\n                lineNumber: 34,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                ...pageProps\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\ASUS\\\\Desktop\\\\smartz\\\\smartbook\\\\smartbook\\\\pages\\\\_app.js\",\n                lineNumber: 38,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Users\\\\ASUS\\\\Desktop\\\\smartz\\\\smartbook\\\\smartbook\\\\pages\\\\_app.js\",\n        lineNumber: 18,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQTZCO0FBQ0k7QUFDQztBQUNnQjtBQUNuQjtBQUVoQixTQUFTSSxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsV0FBVyxFQUFFQyxPQUFPLEVBQUUsR0FBR0QsV0FBVyxFQUFFO0lBQzdFLG1DQUFtQztJQUNuQ0osZ0RBQVNBLENBQUM7UUFDUixJQUFJLG1CQUFtQk0sV0FBVztZQUNoQ0EsVUFBVUMsYUFBYSxDQUFDQyxRQUFRLENBQUMsVUFBVUMsS0FBSyxDQUFDO1lBQy9DLHdDQUF3QztZQUMxQztRQUNGO0lBQ0YsR0FBRyxFQUFFO0lBRUwscUJBQ0UsOERBQUNSLDREQUFlQTtRQUFDSSxTQUFTQTs7MEJBQ3hCLDhEQUFDUCxrREFBSUE7O2tDQUNILDhEQUFDWTt3QkFBS0MsU0FBUTs7Ozs7O2tDQUNkLDhEQUFDRDt3QkFBS0UsTUFBSzt3QkFBV0MsU0FBUTs7Ozs7O2tDQUM5Qiw4REFBQ0g7d0JBQUtFLE1BQUs7d0JBQStCQyxTQUFROzs7Ozs7a0NBQ2xELDhEQUFDSDt3QkFBS0UsTUFBSzt3QkFBd0NDLFNBQVE7Ozs7OztrQ0FDM0QsOERBQUNIO3dCQUFLRSxNQUFLO3dCQUF5QkMsU0FBUTs7Ozs7O2tDQUM1Qyw4REFBQ0g7d0JBQUtFLE1BQUs7d0JBQW1CQyxTQUFROzs7Ozs7a0NBQ3RDLDhEQUFDSDt3QkFBS0UsTUFBSzt3QkFBY0MsU0FBUTs7Ozs7O2tDQUNqQyw4REFBQ0g7d0JBQUtFLE1BQUs7d0JBQWNDLFNBQVE7Ozs7OztrQ0FDakMsOERBQUNDO3dCQUFLQyxLQUFJO3dCQUFXQyxNQUFLOzs7Ozs7a0NBQzFCLDhEQUFDRjt3QkFBS0MsS0FBSTt3QkFBT0MsTUFBSzs7Ozs7O2tDQUN0Qiw4REFBQ0Y7d0JBQUtDLEtBQUk7d0JBQW1CQyxNQUFLOzs7Ozs7a0NBQ2xDLDhEQUFDQztrQ0FBTTs7Ozs7Ozs7Ozs7OzBCQUdULDhEQUFDbEIsb0RBQU1BO2dCQUNMbUIsS0FBSyxDQUFDLDRDQUE0QyxFQUFFQyx5Q0FBdUMsSUFBSSxFQUFHLHNDQUFzQyxDQUFDO2dCQUN6SUcsVUFBUzs7Ozs7OzBCQUVYLDhEQUFDbkI7Z0JBQVcsR0FBR0MsU0FBUzs7Ozs7Ozs7Ozs7O0FBRzlCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZmFyZXhvLy4vcGFnZXMvX2FwcC5qcz9lMGFkIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBIZWFkIGZyb20gJ25leHQvaGVhZCc7XG5pbXBvcnQgU2NyaXB0IGZyb20gJ25leHQvc2NyaXB0JztcbmltcG9ydCB7IHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IFNlc3Npb25Qcm92aWRlciB9IGZyb20gJ25leHQtYXV0aC9yZWFjdCc7XG5pbXBvcnQgJy4uL3N0eWxlcy9nbG9iYWxzLmNzcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzOiB7IHNlc3Npb24sIC4uLnBhZ2VQcm9wcyB9IH0pIHtcbiAgLy8gUmVnaXN0ZXIgU2VydmljZSBXb3JrZXIgb24gbW91bnRcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikge1xuICAgICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJy9zdy5qcycpLmNhdGNoKCgpID0+IHtcbiAgICAgICAgLy8gU1cgcmVnaXN0cmF0aW9uIGZhaWxlZCDigJQgbm9uLWNyaXRpY2FsXG4gICAgICB9KTtcbiAgICB9XG4gIH0sIFtdKTtcblxuICByZXR1cm4gKFxuICAgIDxTZXNzaW9uUHJvdmlkZXIgc2Vzc2lvbj17c2Vzc2lvbn0+XG4gICAgICA8SGVhZD5cbiAgICAgICAgPG1ldGEgY2hhclNldD1cInV0Zi04XCIgLz5cbiAgICAgICAgPG1ldGEgbmFtZT1cInZpZXdwb3J0XCIgY29udGVudD1cIndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLCBtaW5pbXVtLXNjYWxlPTEsIG1heGltdW0tc2NhbGU9MSwgdXNlci1zY2FsYWJsZT1ubywgdmlld3BvcnQtZml0PWNvdmVyXCIgLz5cbiAgICAgICAgPG1ldGEgbmFtZT1cImFwcGxlLW1vYmlsZS13ZWItYXBwLWNhcGFibGVcIiBjb250ZW50PVwieWVzXCIgLz5cbiAgICAgICAgPG1ldGEgbmFtZT1cImFwcGxlLW1vYmlsZS13ZWItYXBwLXN0YXR1cy1iYXItc3R5bGVcIiBjb250ZW50PVwiYmxhY2stdHJhbnNsdWNlbnRcIiAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwibW9iaWxlLXdlYi1hcHAtY2FwYWJsZVwiIGNvbnRlbnQ9XCJ5ZXNcIiAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwiZm9ybWF0LWRldGVjdGlvblwiIGNvbnRlbnQ9XCJ0ZWxlcGhvbmU9bm9cIiAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwidGhlbWUtY29sb3JcIiBjb250ZW50PVwiIzExMTgyN1wiIC8+XG4gICAgICAgIDxtZXRhIG5hbWU9XCJkZXNjcmlwdGlvblwiIGNvbnRlbnQ9XCJDb21wYXJlIHJpZGVzIGFjcm9zcyBVYmVyLCBPbGEsIFJhcGlkbywgTmFtbWEgWWF0cmkgYW5kIG1vcmUuIEZpbmQgdGhlIGNoZWFwZXN0IGFuZCBmYXN0ZXN0IHJpZGUgaW5zdGFudGx5LlwiIC8+XG4gICAgICAgIDxsaW5rIHJlbD1cIm1hbmlmZXN0XCIgaHJlZj1cIi9tYW5pZmVzdC5qc29uXCIgLz5cbiAgICAgICAgPGxpbmsgcmVsPVwiaWNvblwiIGhyZWY9XCIvaWNvbnMvaWNvbi0xOTJ4MTkyLnBuZ1wiIC8+XG4gICAgICAgIDxsaW5rIHJlbD1cImFwcGxlLXRvdWNoLWljb25cIiBocmVmPVwiL2ljb25zL2ljb24tMTkyeDE5Mi5wbmdcIiAvPlxuICAgICAgICA8dGl0bGU+RkFSRVhPIOKAkyBSaWRlIENvbXBhcmlzb248L3RpdGxlPlxuICAgICAgPC9IZWFkPlxuICAgICAgey8qIEdvb2dsZSBNYXBzIFBsYWNlcyBBUEkg4oCUIGxvYWRlZCBhc3luYyBwZXIgYmVzdC1wcmFjdGljZXMgKi99XG4gICAgICA8U2NyaXB0XG4gICAgICAgIHNyYz17YGh0dHBzOi8vbWFwcy5nb29nbGVhcGlzLmNvbS9tYXBzL2FwaS9qcz9rZXk9JHtwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19HT09HTEVfTUFQU19LRVkgfHwgJyd9JmxpYnJhcmllcz1wbGFjZXMsbWFya2VyJmxvYWRpbmc9YXN5bmNgfVxuICAgICAgICBzdHJhdGVneT1cImFmdGVySW50ZXJhY3RpdmVcIlxuICAgICAgLz5cbiAgICAgIDxDb21wb25lbnQgey4uLnBhZ2VQcm9wc30gLz5cbiAgICA8L1Nlc3Npb25Qcm92aWRlcj5cbiAgKTtcbn1cblxuIl0sIm5hbWVzIjpbIkhlYWQiLCJTY3JpcHQiLCJ1c2VFZmZlY3QiLCJTZXNzaW9uUHJvdmlkZXIiLCJBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiLCJzZXNzaW9uIiwibmF2aWdhdG9yIiwic2VydmljZVdvcmtlciIsInJlZ2lzdGVyIiwiY2F0Y2giLCJtZXRhIiwiY2hhclNldCIsIm5hbWUiLCJjb250ZW50IiwibGluayIsInJlbCIsImhyZWYiLCJ0aXRsZSIsInNyYyIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19HT09HTEVfTUFQU19LRVkiLCJzdHJhdGVneSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "next-auth/react":
/*!**********************************!*\
  !*** external "next-auth/react" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("next-auth/react");

/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "next/head":
/*!****************************!*\
  !*** external "next/head" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/head");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./pages/_app.js")));
module.exports = __webpack_exports__;

})();