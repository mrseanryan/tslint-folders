import * as ts from "typescript";
import {Something} from "mobx/lib/mobx";
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ [do not import from invalid folder like 'mobx/lib/mobx' (tsf-folders-import-from-disallowed-folders)]
import {Something} from "mobx/lib/mobx/SomeFile";
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ [do not import from invalid folder like 'mobx/lib/mobx' (tsf-folders-import-from-disallowed-folders)]
import * as path from "path";
