const logger = require("./LogHelper");

module.exports = () => {
    return (req, res, next) => {
        /** GET,URL,POST,PUT,DELETE 파라미터를 수신하여 값을 리턴하는 함수 */
        res.setHeader("Access-Control-Allow-origin", "*");
        res.setHeader("Access-Control-Allow-Credentials", "true"); // 쿠키 주고받기 허용

        req._getParam = (method, key, def = null) => {
            let value = null;

            // --> 파라미터를 받지만 빈 문자열이거나 공백으로만 구성된 경우는 걸러내지 못한다.
            if (method.toUpperCase() === "GET") {
                value = req.query[key] || req.params[key] || def;
            } else {
                value = req.body[key] || def;
            }

            if (value == undefined) {
                value = def;
            }

            // 2) 빈 문자열이거나 공백인 경우 걸러내기
            if (value !== null && typeof value == "string") {
                value = value.trim();

                if (value.length == 0) {
                    value = def;
                }
            }
            logger.debug("[HTTP %s Params] %s=%s", method, key, value);
            return value;
        };

        /** get 파라미터 수신 함수 --> _get_param 함수를 호출한다. */
        req.get = function (key, def) {
            return this._getParam("GET", key, def);
        };

        /** post 파라미터 수신 함수 --> _get_param 함수를 호출한다. */
        req.post = function (key, def) {
            return this._getParam("POST", key, def);
        };

        /** put 파라미터 수신 함수 --> _get_param 함수를 호출한다. */
        req.put = function (key, def) {
            return this._getParam("PUT", key, def);
        };

        /** delete 파라미터 수신 함수 --> _get_param 함수를 호출한다. */
        req.delete = function (key, def) {
            return this._getParam("DELETE", key, def);
        };

        /** 프론트엔드에게 JSON결과를 출려하는 기능 */
        res.sendResult = (statusCode, message, data) => {
            const json = {
                rt: statusCode,
                rtmsg: message,
            };

            if (data !== undefined) {
                for (const key in data) {
                    json[key] = data[key];
                }
            }

            json.pubdate = new Date().toISOString();
            res.status(statusCode).send(json);
        };

        /** 결과가 200(OK)인 경우에 대한 JSON 출력 */
        res.sendJson = (data) => {
            res.sendResult(200, "OK", data);
        };

        /** 에러처리 출력 */
        res.sendError = (error) => {
            logger.error(error.name);
            logger.error(error.message);
            logger.error(error.stack);
            res.sendResult(error.statusCode, error.message);
        };

        next();
    };
};
