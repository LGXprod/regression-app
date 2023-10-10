const std = @import("std");
const print = std.debug.print;
const expect = std.testing.expect;
const ArenaAllocator = std.heap.ArenaAllocator;
const FixedBufferAllocator = std.heap.FixedBufferAllocator;
const ArrayList = std.ArrayList;

const TrainingSet = struct {
    x: ArrayList(f64),
    y: ArrayList(f64),
};

const LinearRegression = struct {
    trainingSet: TrainingSet,
    gradient: f64,
    yIntercept: f64,

    pub fn init(trainingSet: TrainingSet) LinearRegression {
        return LinearRegression{
            .trainingSet = trainingSet,
            .gradient = 0.0,
            .yIntercept = 0.0,
        };
    }

    pub fn getY(self: LinearRegression, x: f64) f64 {
        return self.gradient * x + self.yIntercept;
    }

    pub fn train(self: *LinearRegression) void {
        var xSum: f64 = 0.0;
        var ySum: f64 = 0.0;
        var xSquaredSum: f64 = 0.0;
        var xyProdSum: f64 = 0.0;
        var n: f64 = 0.0;

        var i: usize = 0;

        while (i < self.trainingSet.x.items.len) : (i += 1) {
            var x: f64 = self.trainingSet.x.items[i];
            var y: f64 = self.trainingSet.y.items[i];

            xSum += x;
            ySum += y;
            xSquaredSum += x * x;
            xyProdSum += x * y;

            n += 1.0;
        }

        var numerator: f64 = n * xyProdSum - xSum * ySum;
        var denominator: f64 = n * xSquaredSum - xSum * xSum;

        self.gradient = numerator / denominator;
        self.yIntercept = (ySum - self.gradient * xSum) / n;
    }
};

test "linear regression of: y = 2x + 3" {
    // const arena = ArenaAllocator.init(FixedBufferAllocator);
    // defer arena.deinit();

    // const fixedBuffer = FixedBufferAllocator.init()

    // const arenaAllocator = arena.allocator();

    var x_train = ArrayList(f64).init(std.heap.page_allocator);
    defer x_train.deinit();

    var y_train = ArrayList(f64).init(std.heap.page_allocator);
    defer y_train.deinit();

    var prng = std.rand.DefaultPrng.init(blk: {
        var seed: u64 = undefined;
        try std.os.getrandom(std.mem.asBytes(&seed));
        break :blk seed;
    });
    const rand = prng.random();

    const gradient: f64 = rand.float(f64);
    const yIntercept: f64 = rand.float(f64);

    // print("\n{}\n", .{gradient});
    // print("{}\n", .{yIntercept});

    var i: u8 = 0;

    while (i < 10) : (i += 1) {
        const x: f64 = rand.float(f64);

        try x_train.append(x);
        try y_train.append((gradient * x) + yIntercept);
    }

    var x_test = ArrayList(f64).init(std.heap.page_allocator);
    defer x_test.deinit();

    var y_test = ArrayList(f64).init(std.heap.page_allocator);
    defer y_test.deinit();

    i = 0;

    while (i < 10) : (i += 1) {
        const x: f64 = rand.float(f64);

        try x_test.append(x);
        try y_test.append((gradient * x) + yIntercept);
    }

    const trainingSet = TrainingSet{ .x = x_train, .y = y_train };

    var linearRegression = LinearRegression.init(trainingSet);
    linearRegression.train();

    i = 0;

    while (i < 10) : (i += 1) {
        try expect(linearRegression.getY(x_test.items[i]) == y_test.items[i]);
    }
}
