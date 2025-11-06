# Enforcing formatting standards project wide
# See treefmt-nix over @ https://github.com/numtide/treefmt-nix
{ ... }:
{
  projectRootFile = ".git/config";
  programs.nixfmt.enable = true;
  programs.rustfmt.enable = true;
  programs.yamlfmt.enable = true;
  programs.typstyle.enable = true;
  programs.d2.enable = true;
  programs.prettier.enable = true;
}
