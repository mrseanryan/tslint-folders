import {SomeClass} from "../components/SomeClass";
// ignored, since is not configured! - ['todo-area' sub folder 'utils' is not allowed to import from 'components' (tsf-folders-imports-between-packages)]
import {SomeClass} from "../viewmodels/SomeClass";
// ignored, since is not configured! - ['todo-area' sub folder 'utils' is not allowed to import from 'viewmodels' (tsf-folders-imports-between-packages)]
import {SomeClass} from "unrecognisedPackage/someCode";
import {SomeClass} from "./someFolder/someCode";
import {SomeClass} from "../someCode";
