use strict;
use warnings;
use diagnostics;

open(my $OUT, ">", $ARGV[0]) or die "Bad output: $1";
binmode($OUT);


while(<STDIN>) {
	chomp;
	my @l = split(" ");

	my $b1 =  ($l[0] & 0b1111111100) >> 2;
	my $b2 = (($l[0] & 0b0000000011) << 6) + (($l[1] & 0b1111110000) >> 4);
	my $b3 = (($l[1] & 0b0000001111) << 4) + $l[2];
	# printf "%x %x %x\n", $b1, $b2, $b3;

	# print pack("C3", $b1, $b2, $b3);
	print $OUT pack("C3", $b1, $b2, $b3);
}

close($OUT);
