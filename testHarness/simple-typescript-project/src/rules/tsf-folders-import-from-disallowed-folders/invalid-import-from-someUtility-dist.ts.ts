import * as ts from "typescript";
import {microflows} from "../some-package/node_modules";
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ [do not import from invalid folder like '/node_modules' (tsf-folders-import-from-disallowed-folders)]
import {microflows} from "someUtilityPackage/dist";
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ [do not import from invalid folder like '/dist' (tsf-folders-import-from-disallowed-folders)]
import * as path from "path";
