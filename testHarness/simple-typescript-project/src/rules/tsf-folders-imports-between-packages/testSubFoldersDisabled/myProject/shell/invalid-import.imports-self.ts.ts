import {SomeClass} from "contact-area/someCode";
import {SomeClass} from "grid-package/someCode";
import {SomeClass} from "shell";
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ [do not import a package from itself - use a relative path (tsf-folders-imports-between-packages)]
import {SomeClass} from "todo-area";
import {SomeClass} from "unrecognisedPackage/someCode";
import {SomeClass} from "utils/someCode";
import {SomeClass} from "./someFolder/someCode";
import {SomeClass} from "../someCode";
