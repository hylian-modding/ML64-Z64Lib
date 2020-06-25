import { ManifestOffets } from "../Z64ManifestMapper";
import path from 'path';

export class OotManifests {
    getManifest(target: ManifestOffets): string {
        switch (target) {
            case ManifestOffets.OOT_CHILD:
                return path.resolve(__dirname, "child-link.txt");
            case ManifestOffets.OOT_ADULT:
                return path.resolve(__dirname, "adult-link.txt");
        }
    }
}
