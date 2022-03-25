let

  sources  = import ./nix/sources.nix;
  pkgs     = import sources.nixpkgs {};
  unstable = import sources.unstable {};

in

  pkgs.mkShell {
    buildInputs = [

      unstable.deno
      unstable.dprint
      unstable.just
      unstable.niv

    ];
  }
