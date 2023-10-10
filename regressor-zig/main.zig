pub fn main() void {
    comptime {
        _ = @import("linearRegression.zig");
        // And all other files
    }
}

test {
    @import("std").testing.refAllDecls(@This());
}
