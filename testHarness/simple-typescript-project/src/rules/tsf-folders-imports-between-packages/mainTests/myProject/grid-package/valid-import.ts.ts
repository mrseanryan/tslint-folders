// grid-package cannot import from any other recognised packages
import {SomeClass} from "thirdPartySdk/someCode";
import {SomeClass} from "unrecognisedPackage/someCode";
import {SomeClass} from "./someFolder/someCode";
import {SomeClass} from "../someCode";
