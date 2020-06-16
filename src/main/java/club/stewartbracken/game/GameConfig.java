package club.stewartbracken.game;

public class GameConfig {

    private final int cellCountX, cellCountY;

    private GameConfig(final int cellCountX, final int cellCountY) {
        this.cellCountX = cellCountX;
        this.cellCountY = cellCountY;
    }

    public int getCellCountX() {
        return this.cellCountX;
    }

    public int getCellCountY() {
        return this.cellCountY;
    }

    public static GameConfigBuilder builder() {
        return new GameConfigBuilder();
    }

    public static class GameConfigBuilder {

        private int cellCountX;
        private int cellCountY;

        private GameConfigBuilder() {
        }

        public GameConfigBuilder setCellCountX(final int cellCountX) {
            this.cellCountX = cellCountX;
            return this;
        }

        public GameConfigBuilder setCellCountY(final int cellCountY) {
            this.cellCountY = cellCountY;
            return this;
        }

        public GameConfig build() {
            return new GameConfig(this.cellCountX, this.cellCountY);
        }
    }
}
