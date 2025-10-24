{
  stdenvNoCC,
}:

let
  req-file = ../../../../docs/Project.md;
in
stdenvNoCC.mkDerivation {
  name = "${req-file}";
  src = [ ];
  dontBuild = true;
  dontUnpack = true;
  installPhase = ''
    mkdir -p "$out"
    rm -rf "$out/*" | true
    cp "${req-file}" "$out/Project.md"
  '';
}
